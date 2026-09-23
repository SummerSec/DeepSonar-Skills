#!/usr/bin/env node
// 仓库一致性校验（零依赖，Node >= 18）。
// 覆盖五类结构契约：
//   1. marketplace.json 条目 version ↔ 各插件 plugin.json；仓库根三处元数据版本一致
//   2. 内部 Markdown 链接目标存在（外链跳过）
//   3. references/*.md 无孤儿（被所属 plugin 的 SKILL.md / README.md 点名）
//   4. 桥接摘要与域插件权威条款的条款 ID 集合一致
//   5. shared/finding-schema.md 中 `X.md#ID` 形式的交叉引用可解析
// 用法：npm run check   （退出码非 0 表示存在不符合项）

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname, resolve, relative, basename, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SKIP_DIRS = new Set([".git", "node_modules"]);
const text = (p) => readFileSync(p, "utf8").replace(/\r\n/g, "\n");
const rel = (p) => relative(ROOT, p).split(sep).join("/");

/** 解析 JSON；格式错误时返回 null 并记入 failures，避免脚本自身崩溃。 */
function readJson(p) {
  try {
    return JSON.parse(text(p));
  } catch (err) {
    failures.push(`[JSON] ${rel(p)} 解析失败：${err.message}`);
    return null;
  }
}

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const allFiles = walk(ROOT);
const mdFiles = allFiles.filter((p) => p.endsWith(".md"));
const mdRel = mdFiles.map(rel);
const mdByBase = new Map();
for (const p of mdRel) {
  const b = basename(p);
  if (!mdByBase.has(b)) mdByBase.set(b, []);
  mdByBase.get(b).push(p);
}

const failures = [];
const check = (name, fn) => {
  const found = fn() || [];
  for (const f of found) failures.push(`[${name}] ${f}`);
  console.log(`${found.length ? "✗" : "✓"} ${name}${found.length ? `  (${found.length})` : ""}`);
  for (const f of found) console.log(`    - ${f}`);
};

// ---------- 1. 版本对齐 ----------
check("版本对齐（marketplace ↔ plugin.json ↔ 根元数据）", () => {
  const out = [];
  const mp = readJson(join(ROOT, ".claude-plugin/marketplace.json"));
  for (const entry of mp?.plugins ?? []) {
    const dir = resolve(ROOT, entry.source ?? ".");
    const pj = join(dir, ".claude-plugin/plugin.json");
    if (!existsSync(pj)) {
      out.push(`${entry.name}: 缺少 .claude-plugin/plugin.json（source=${entry.source}）`);
      continue;
    }
    const v = readJson(pj)?.version;
    if (v !== entry.version) out.push(`${entry.name}: plugin.json=${v} ≠ marketplace=${entry.version}`);
  }
  const versions = {};
  for (const p of ["package.json", "plugin.json", ".claude-plugin/plugin.json"]) {
    versions[p] = readJson(join(ROOT, p))?.version;
  }
  const uniq = new Set(Object.values(versions));
  if (uniq.size > 1) {
    out.push(`仓库根版本不一致：${Object.entries(versions).map(([k, v]) => `${k}=${v}`).join(", ")}`);
  }
  return out;
});

// ---------- 2. 内部链接 ----------
check("内部 Markdown 链接可解析", () => {
  const out = [];
  const re = /\]\(([^)\s]+\.md)(#[^)]*)?\)/g;
  for (const file of mdRel) {
    const body = text(join(ROOT, file));
    for (const m of body.matchAll(re)) {
      const target = m[1];
      if (/^(https?:|mailto:)/i.test(target)) continue;
      const asRelative = resolve(ROOT, dirname(file), target);
      const asRooted = resolve(ROOT, target);
      const byBase = mdByBase.has(basename(target));
      if (!existsSync(asRelative) && !existsSync(asRooted) && !byBase) {
        out.push(`${file} → ${target}`);
      }
    }
  }
  return out;
});

// ---------- 3. 孤儿 reference ----------
check("references 无孤儿（被所属 plugin 的 SKILL/README 点名）", () => {
  const out = [];
  const refDirs = allFiles
    .filter((p) => p.endsWith(".md") && basename(dirname(p)) === "references")
    .map((p) => dirname(p));
  for (const dir of new Set(refDirs)) {
    // 索引文本范围：从 references 的父目录向上，直到遇到含 .claude-plugin 的 plugin 根
    const scope = [];
    let cur = dirname(dir);
    for (let i = 0; i < 6; i++) {
      for (const name of readdirSync(cur)) {
        const p = join(cur, name);
        if (statSync(p).isFile() && p.endsWith(".md")) scope.push(p);
      }
      if (existsSync(join(cur, ".claude-plugin"))) break;
      const up = dirname(cur);
      if (up === cur || up.length < ROOT.length) break;
      cur = up;
    }
    const index = scope.map(text).join("\n");
    for (const name of readdirSync(dir)) {
      if (!name.endsWith(".md")) continue;
      if (!index.includes(name)) out.push(`${rel(join(dir, name))} 未被 ${rel(dirname(dir))}/*.md 点名`);
    }
  }
  return out;
});

// ---------- 4. 桥接摘要 ↔ 域插件权威条款 ID ----------
const BRIDGES = {
  "vuln-definitions/references/openharmony.md": "vuln-definitions-oh/references/severity-levels.md",
  "vuln-definitions/references/chromium.md": "vuln-definitions-chrome/references/severity-levels.md",
  "vuln-definitions/references/database.md": "vuln-definitions-db/references/severity-levels.md",
  "vuln-definitions/references/mobile.md": "vuln-definitions-mobile/references/severity-levels.md",
};
check("桥接摘要 ↔ 域插件权威条款 ID 集合一致", () => {
  const out = [];
  const ids = (body) => new Set([...body.matchAll(/\b([CHML]\d{1,2}[a-z]?)\b/g)].map((m) => m[1]));
  for (const [bridge, authority] of Object.entries(BRIDGES)) {
    for (const p of [bridge, authority]) {
      if (!existsSync(join(ROOT, p))) out.push(`缺少文件：${p}`);
    }
    if (!existsSync(join(ROOT, bridge)) || !existsSync(join(ROOT, authority))) continue;
    const b = ids(text(join(ROOT, bridge)));
    const a = ids(text(join(ROOT, authority)));
    const missing = [...a].filter((x) => !b.has(x)).sort();
    const extra = [...b].filter((x) => !a.has(x)).sort();
    if (missing.length) out.push(`${bridge} 缺权威条款：${missing.join(", ")}`);
    if (extra.length) out.push(`${bridge} 多出条款：${extra.join(", ")}`);
  }
  return out;
});

// ---------- 5. finding-schema 交叉引用 ----------
check("finding-schema 的 `X.md#ID` 交叉引用可解析", () => {
  const out = [];
  const schema = "shared/finding-schema.md";
  if (!existsSync(join(ROOT, schema))) return [`缺少 ${schema}`];
  const body = text(join(ROOT, schema));
  const seen = new Set();
  for (const m of body.matchAll(/\b([\w.-]+\.md)#([A-Za-z0-9]+)\b/g)) {
    const [, file, id] = m;
    const key = `${file}#${id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const candidates = mdByBase.get(file) ?? [];
    if (!candidates.length) {
      out.push(`${schema}: 引用的文件不存在 → ${file}`);
      continue;
    }
    const hit = candidates.some((p) => new RegExp(`\\b${id}\\b`).test(text(join(ROOT, p))));
    if (!hit) out.push(`${schema}: ${key} 在 ${file} 中查不到该 ID`);
  }
  return out;
});

console.log(
  failures.length
    ? `\n一致性校验未通过：${failures.length} 项。`
    : `\n一致性校验通过（Markdown ${mdFiles.length} 个文件）。`,
);
process.exit(failures.length ? 1 : 0);
