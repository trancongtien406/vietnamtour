#!/usr/bin/env python3
"""Merge the Design Engineering fragment into an existing EI control plane.

EI's catalog and route files use JSON-compatible YAML. This merger uses only
the Python standard library, validates every target before writing, rejects ID
conflicts, preserves a one-time pre-integration backup, and is idempotent.
"""
from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
import sys
import tempfile
from typing import Any


TARGETS = {
    "capabilities": ("registry/capabilities.json", "capabilities", "list"),
    "capabilityGraphNodes": ("registry/capability-graph.json", "nodes", "map"),
    "contexts": ("context/catalog.yaml", "contexts", "map"),
    "routes": ("context/routes.yaml", "routes", "list"),
}


class IntegrationError(Exception):
    pass


def read_json(path: Path) -> dict[str, Any]:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise IntegrationError(f"required EI file is missing: {path}") from exc
    except json.JSONDecodeError as exc:
        raise IntegrationError(f"EI catalog must be JSON-compatible YAML: {path}: {exc}") from exc
    if not isinstance(value, dict):
        raise IntegrationError(f"EI catalog root must be an object: {path}")
    return value


def merge_list(current: Any, incoming: Any, label: str) -> tuple[list[dict[str, Any]], bool]:
    if not isinstance(current, list) or not isinstance(incoming, list):
        raise IntegrationError(f"{label} must be an array")
    result = list(current)
    by_id: dict[str, dict[str, Any]] = {}
    for item in current:
        if not isinstance(item, dict) or not isinstance(item.get("id"), str):
            raise IntegrationError(f"{label} contains an entry without a string id")
        item_id = item["id"]
        if item_id in by_id:
            raise IntegrationError(f"{label} contains duplicate id: {item_id}")
        by_id[item_id] = item
    changed = False
    for item in incoming:
        if not isinstance(item, dict) or not isinstance(item.get("id"), str):
            raise IntegrationError(f"{label} fragment contains an entry without a string id")
        item_id = item["id"]
        if item_id in by_id:
            if by_id[item_id] != item:
                raise IntegrationError(
                    f"{label} id '{item_id}' already exists with different content; "
                    "resolve the conflict before integration"
                )
            continue
        result.append(item)
        by_id[item_id] = item
        changed = True
    return result, changed


def merge_map(current: Any, incoming: Any, label: str) -> tuple[dict[str, Any], bool]:
    if not isinstance(current, dict) or not isinstance(incoming, dict):
        raise IntegrationError(f"{label} must be an object")
    result = dict(current)
    changed = False
    for item_id, item in incoming.items():
        if item_id in result:
            if result[item_id] != item:
                raise IntegrationError(
                    f"{label} id '{item_id}' already exists with different content; "
                    "resolve the conflict before integration"
                )
            continue
        result[item_id] = item
        changed = True
    return result, changed


def validate_graph(capabilities: dict[str, Any], graph: dict[str, Any]) -> None:
    capability_ids = {item["id"] for item in capabilities["capabilities"]}
    graph_ids = set(graph["nodes"])
    missing_nodes = sorted(capability_ids - graph_ids)
    if missing_nodes:
        raise IntegrationError("capabilities missing graph nodes: " + ", ".join(missing_nodes))
    for node_id, node in graph["nodes"].items():
        dependencies = list(node.get("requires", [])) + list(node.get("implies", []))
        for group in node.get("requiresAny", []):
            dependencies.extend(group if isinstance(group, list) else [group])
        missing = sorted(set(dependencies) - capability_ids)
        if missing:
            raise IntegrationError(f"graph node '{node_id}' references missing capabilities: {', '.join(missing)}")


def atomic_write(path: Path, content: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, temp_name = tempfile.mkstemp(prefix=f".{path.name}.", suffix=".tmp", dir=path.parent)
    try:
        with os.fdopen(fd, "wb") as stream:
            stream.write(content)
            stream.flush()
            os.fsync(stream.fileno())
        os.replace(temp_name, path)
    finally:
        Path(temp_name).unlink(missing_ok=True)


def integrate(root: Path, fragment_path: Path, *, check_only: bool) -> int:
    ei = root / ".engineer-intelligence"
    fragment = read_json(fragment_path)
    config_data: dict[str, dict[str, Any]] = {}
    raw_data: dict[str, bytes] = {}
    changed_files: list[str] = []

    for fragment_key, (relative, target_key, kind) in TARGETS.items():
        path = ei / relative
        data = read_json(path)
        raw_data[relative] = path.read_bytes()
        payload = fragment.get(fragment_key)
        if payload is None:
            raise IntegrationError(f"fragment is missing '{fragment_key}'")
        if kind == "list":
            merged, changed = merge_list(data.get(target_key, []), payload, f"{relative}:{target_key}")
        else:
            merged, changed = merge_map(data.get(target_key, {}), payload, f"{relative}:{target_key}")
        if changed:
            data[target_key] = merged
            changed_files.append(relative)
        config_data[relative] = data

    validate_graph(config_data["registry/capabilities.json"], config_data["registry/capability-graph.json"])

    if check_only:
        if changed_files:
            print("Would integrate Design Engineering into: " + ", ".join(changed_files))
        else:
            print("Design Engineering routing is already integrated and current.")
        return 0

    backup_root = ei / "extensions/design-engineering/.backups"
    for relative in changed_files:
        original = raw_data[relative]
        backup = backup_root / (relative.replace("/", "__") + ".before-design-engineering")
        if not backup.exists():
            atomic_write(backup, original)

    for relative in changed_files:
        content = (json.dumps(config_data[relative], ensure_ascii=False, indent=2) + "\n").encode("utf-8")
        atomic_write(ei / relative, content)

    if changed_files:
        print("Integrated Design Engineering routing into: " + ", ".join(changed_files))
    else:
        print("Design Engineering routing was already integrated; no files changed.")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("project_root", type=Path, help="Project root containing .engineer-intelligence")
    parser.add_argument("--fragment", type=Path, help="Fragment path; defaults to the installed module fragment")
    parser.add_argument("--check", action="store_true", help="Validate and report without writing")
    args = parser.parse_args()
    root = args.project_root.resolve()
    fragment = (args.fragment or root / ".engineer-intelligence/extensions/design-engineering/ei-integration-fragment.json").resolve()
    if not (root / ".engineer-intelligence").is_dir():
        print("EI control plane not found at project root", file=sys.stderr)
        return 2
    try:
        return integrate(root, fragment, check_only=args.check)
    except IntegrationError as exc:
        print(f"Design Engineering integration failed: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
