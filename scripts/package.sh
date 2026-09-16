#!/usr/bin/env bash
# Builds the Chrome Web Store zip: manifest.json must sit at the archive root.
set -euo pipefail
cd "$(dirname "$0")/.."
exec python3 scripts/package.py
