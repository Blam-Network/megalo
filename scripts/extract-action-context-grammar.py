#!/usr/bin/env python3
"""
Extract MegaloEdit action operand grammar from HREK ManagedMegalo.dll.

Writes docs/.vitepress/action-context-grammar.json.

Requires:
  - ManagedMegalo.dll (default: HREK bin path)
  - Decompiled -Module-.cs (default: MANAGED_MEGALO_MODULE env or skip if bundled)

Usage:
  python scripts/extract-action-context-grammar.py
  MANAGED_MEGALO_DLL=/path/ManagedMegalo.dll python scripts/extract-action-context-grammar.py
"""
from __future__ import annotations

import json
import os
import re
import sys
from pathlib import Path

try:
    import pefile
except ImportError:
    print("pip install pefile", file=sys.stderr)
    sys.exit(1)

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / ".vitepress" / "action-context-grammar.json"
DEFAULT_DLL = Path(
    r"C:\Program Files (x86)\Steam\steamapps\common\HREK\bin\ManagedMegalo.dll"
)
DEFAULT_MODULE = Path(
    os.environ.get(
        "MANAGED_MEGALO_MODULE",
        r"C:\Users\codie\Desktop\managedmegalo\managedmegalo\-Module-.cs",
    )
)
BLF_MCC_ENUM = (
    ROOT.parent
    / "blf"
    / "blf-ts"
    / "src"
    / "blam"
    / "haloreach_mcc"
    / "v_untracked_25_08_16_1352"
    / "game"
    / "megalogamengine"
    / "megalogamengine_actions.ts"
)


def read_cstring(data: bytes, offset: int) -> str:
    end = data.find(b"\x00", offset)
    return data[offset:end].decode("ascii", "replace")


def parse_enum(enum_src: str) -> dict[int, str]:
    body = enum_src.split("export enum e_action_type {", 1)[1].split("}", 1)[0]
    out: dict[int, str] = {}
    for name, value in re.findall(r"(\w+)\s*=\s*(\d+)", body):
        out[int(value)] = name
    return out


def normalize_grammar(grammar: str) -> str:
    math_op_alts = (
        r"\{add\|subtract\|multiply\|divide\|set_to\|modulo"
        r"\|and\|xor\|not\|lshift\|rshift\|abs\}"
    )
    grammar = re.sub(math_op_alts, "<math_operation>", grammar)
    grammar = re.sub(r"<operation>", "<math_operation>", grammar, flags=re.I)
    return grammar


def main() -> None:
    dll_path = Path(os.environ.get("MANAGED_MEGALO_DLL", DEFAULT_DLL))
    module_path = Path(os.environ.get("MANAGED_MEGALO_MODULE", DEFAULT_MODULE))

    if not dll_path.is_file():
        raise SystemExit(f"ManagedMegalo.dll not found: {dll_path}")

    if not module_path.is_file():
        raise SystemExit(f"-Module-.cs not found: {module_path}")

    if not BLF_MCC_ENUM.is_file():
        raise SystemExit(f"MCC e_action_type enum not found: {BLF_MCC_ENUM}")

    module = module_path.read_text(encoding="utf-8", errors="replace")
    enum = parse_enum(BLF_MCC_ENUM.read_text(encoding="utf-8"))

    sym_rva: dict[str, int] = {}
    for match in re.finditer(
        r"RVA: 0x([0-9A-Fa-f]+)[^\n]*\n\s*internal static[^\n]*(\?\?_C@[^\s;]+)",
        module,
    ):
        sym_rva[match.group(2)] = int(match.group(1), 16)

    describe = re.search(
        r"internal unsafe static sbyte\* describe\(e_action_type type\)\s*\{(.*?)\n\t\}",
        module,
        re.S,
    )
    if not describe:
        raise SystemExit("c_action.describe switch not found in -Module-.cs")

    cases: dict[int, str] = {}
    for match in re.finditer(
        r"case \(e_action_type\)(\d+):\s*\n\s*result = \(sbyte\*\)\(&<Module>\.([^)]+)\);",
        describe.group(1),
    ):
        cases[int(match.group(1))] = match.group(2).strip()

    data = dll_path.read_bytes()
    pe = pefile.PE(str(dll_path))
    empty_sym = "??_C@_00CNPNBAHC@@"

    actions: dict[str, dict[str, object]] = {}
    for action_type, sym in sorted(cases.items()):
        name = enum.get(action_type, f"unknown_{action_type}")
        rva = sym_rva.get(sym)
        if rva is None:
            raise SystemExit(f"Missing RVA for symbol {sym!r} (action {name})")
        grammar = normalize_grammar(read_cstring(data, pe.get_offset_from_rva(rva)))
        is_empty = sym == empty_sym or grammar == ""
        actions[name] = {"grammar": grammar, "empty": is_empty}

    payload = {
        "source": f"ManagedMegalo.dll ({dll_path.name})",
        "dialect": "107-mcc",
        "actions": actions,
    }
    OUT.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(actions)} action grammars to {OUT}")


if __name__ == "__main__":
    main()
