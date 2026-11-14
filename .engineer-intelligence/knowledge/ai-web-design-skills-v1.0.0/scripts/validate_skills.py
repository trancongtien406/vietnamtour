#!/usr/bin/env python3
from pathlib import Path
import re, sys

root = Path(__file__).resolve().parents[1] / ".claude" / "skills"
errors = []
count = 0

for skill_md in root.rglob("SKILL.md"):
    count += 1
    folder = skill_md.parent.name
    text = skill_md.read_text(encoding="utf-8")
    m = re.match(r"^---\n(.*?)\n---\n", text, re.S)
    if not m:
        errors.append(f"{skill_md}: missing YAML frontmatter")
        continue
    fm = m.group(1)
    name = re.search(r"^name:\s*(.+)$", fm, re.M)
    desc = re.search(r"^description:\s*(.+)$", fm, re.M)
    if not name:
        errors.append(f"{skill_md}: missing name")
    elif name.group(1).strip() != folder:
        errors.append(f"{skill_md}: name must match folder ({folder})")
    if not desc or not desc.group(1).strip():
        errors.append(f"{skill_md}: missing description")
    elif len(desc.group(1).strip()) > 1024:
        errors.append(f"{skill_md}: description > 1024 chars")
    if name and not re.fullmatch(r"[a-z0-9-]+", name.group(1).strip()):
        errors.append(f"{skill_md}: invalid name format")

    # validate direct markdown reference paths
    for rel in re.findall(r"`(references/[^`]+\.md)`", text):
        target = skill_md.parent / rel
        if not target.exists():
            errors.append(f"{skill_md}: missing referenced file {rel}")

if errors:
    print("FAILED")
    for e in errors:
        print("-", e)
    sys.exit(1)

print(f"OK: validated {count} skills")
