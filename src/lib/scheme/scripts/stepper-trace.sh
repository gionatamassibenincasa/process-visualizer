#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CLI_TS="${ROOT_DIR}/cli/stepper-cli.ts"

if [[ ! -f "${CLI_TS}" ]]; then
  echo "Error: CLI file not found at ${CLI_TS}."
  exit 1
fi

if command -v tsx >/dev/null 2>&1; then
  exec tsx "${CLI_TS}" "$@"
fi

if command -v npx >/dev/null 2>&1; then
  exec npx --yes tsx "${CLI_TS}" "$@"
fi

if command -v bun >/dev/null 2>&1; then
  exec bun "${CLI_TS}" "$@"
fi

echo "Error: no TypeScript runner found (tsx/npx/bun)."
echo "Install tsx with: npm i -D tsx"
exit 1
