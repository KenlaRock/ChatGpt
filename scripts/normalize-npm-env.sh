#!/usr/bin/env bash
set -euo pipefail

# Run a command while removing invalid npm env config aliases.
# npm warns on npm_config_http_proxy because it maps to unsupported key "http-proxy".
if [[ "$#" -eq 0 ]]; then
  echo "Usage: ./scripts/normalize-npm-env.sh <command> [args...]" >&2
  exit 2
fi

proxy_value="${HTTP_PROXY:-${http_proxy:-}}"
https_proxy_value="${HTTPS_PROXY:-${https_proxy:-}}"

env \
  -u npm_config_http-proxy \
  -u npm_config_https-proxy \
  -u npm_config_http_proxy \
  npm_config_proxy="$proxy_value" \
  npm_config_https_proxy="$https_proxy_value" \
  "$@"
