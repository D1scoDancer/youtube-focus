#!/usr/bin/env bash
# Собирает zip для Chrome Web Store: manifest.json должен лежать в корне архива.
set -euo pipefail
cd "$(dirname "$0")/.."
exec python3 scripts/package.py
