#!/usr/bin/env bash
set -euo pipefail

TARGET=""
MODE="claude"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --target) TARGET="$2"; shift 2 ;;
    --mode) MODE="$2"; shift 2 ;;
    *) echo "Unknown argument: $1"; exit 1 ;;
  esac
done

if [[ -z "$TARGET" ]]; then
  echo "Usage: scripts/install.sh --target /path/to/project [--mode claude|cursor]"
  exit 1
fi

SOURCE="$(cd "$(dirname "$0")/.." && pwd)/.claude/skills"

if [[ "$MODE" == "claude" ]]; then
  DEST="$TARGET/.claude/skills"
elif [[ "$MODE" == "cursor" ]]; then
  DEST="$TARGET/.cursor/skills"
else
  echo "Mode must be claude or cursor"
  exit 1
fi

mkdir -p "$DEST"
cp -R "$SOURCE"/. "$DEST"/
echo "Installed skills to $DEST"
