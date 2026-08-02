#!/usr/bin/env bash
# 在 Debian/Ubuntu 类环境安装黑盒工具（需 root 或 sudo）
# 用法: sudo ./agent-env/install-tools.sh
set -euo pipefail

BIN="${DEEPSONAR_TOOLS_BIN:-/opt/deepsonar-tools/bin}"
mkdir -p "$BIN"
export PATH="$BIN:$PATH"

apt-get update
apt-get install -y --no-install-recommends \
  ca-certificates curl git jq python3 python3-pip ripgrep unzip wget openjdk-17-jre-headless

pip3 install --break-system-packages sqlmap || pip3 install sqlmap

if [[ ! -d /opt/deepsonar-tools/lib/jwt_tool ]]; then
  git clone --depth 1 https://github.com/ticarpi/jwt_tool.git /opt/deepsonar-tools/lib/jwt_tool
fi
cat > "$BIN/jwt_tool" <<'EOF'
#!/bin/sh
exec python3 /opt/deepsonar-tools/lib/jwt_tool/jwt_tool.py "$@"
EOF
chmod +x "$BIN/jwt_tool"

echo "Base tools installed. Install httpx/nuclei/ffuf/interactsh-client/gitleaks/trufflehog binaries into $BIN from official releases (pin versions)."
echo "See tools-manifest.json for the full list."
