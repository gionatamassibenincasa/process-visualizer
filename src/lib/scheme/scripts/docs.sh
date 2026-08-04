#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MODE="${1:-html}"

if [[ ! -f "${ROOT_DIR}/docs/build-docs.sh" ]]; then
  echo "Error: docs/build-docs.sh not found from ${ROOT_DIR}."
  exit 1
fi

bash "${ROOT_DIR}/docs/build-docs.sh" "${MODE}"
