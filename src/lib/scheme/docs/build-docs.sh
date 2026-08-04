#!/usr/bin/env bash
set -euo pipefail

DOCS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUT_DIR="${DOCS_DIR}/dist"
MODE="${1:-html}"

usage() {
  cat <<'USAGE'
Usage: ./build-docs.sh [html|pdf|all]

Build Asciidoctor documentation from docs/*.adoc and docs/adr/*.adoc.
Output directory: docs/dist
USAGE
}

if [[ "${MODE}" != "html" && "${MODE}" != "pdf" && "${MODE}" != "all" ]]; then
  usage
  exit 1
fi

if ! command -v asciidoctor >/dev/null 2>&1; then
  echo "Error: asciidoctor command not found."
  echo "Install with: gem install asciidoctor"
  exit 1
fi

mkdir -p "${OUT_DIR}/html"
mkdir -p "${OUT_DIR}/pdf"

mapfile -t DOC_FILES < <(find "${DOCS_DIR}" -type f -name '*.adoc' ! -path "${OUT_DIR}/*" | sort)

if [[ ${#DOC_FILES[@]} -eq 0 ]]; then
  echo "No .adoc files found in ${DOCS_DIR}."
  exit 0
fi

build_html() {
  echo "Building HTML docs..."
  for file in "${DOC_FILES[@]}"; do
    asciidoctor \
      --safe \
      --failure-level WARN \
      --destination-dir "${OUT_DIR}/html" \
      "${file}"
  done
}

build_pdf() {
  if ! command -v asciidoctor-pdf >/dev/null 2>&1; then
    echo "Error: asciidoctor-pdf command not found."
    echo "Install with: gem install asciidoctor-pdf"
    exit 1
  fi

  echo "Building PDF docs..."
  for file in "${DOC_FILES[@]}"; do
    asciidoctor-pdf \
      --failure-level WARN \
      --destination-dir "${OUT_DIR}/pdf" \
      "${file}"
  done
}

case "${MODE}" in
  html)
    build_html
    ;;
  pdf)
    build_pdf
    ;;
  all)
    build_html
    build_pdf
    ;;
esac

echo "Done. Output available in ${OUT_DIR}."
