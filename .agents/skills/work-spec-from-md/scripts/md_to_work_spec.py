#!/usr/bin/env python3
"""md_to_work_spec.py

Convert a Markdown document into a simple work specification:
- Work steps (derived from headings or top-level lists)
- Work items (bullets/checkboxes/numbered lists under each step)

Usage:
  md_to_work_spec.py INPUT.md [-o OUTPUT.md] [--title TITLE]
  md_to_work_spec.py -  # read from stdin
"""

from __future__ import annotations

import argparse
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Iterable, List, Optional, Tuple


HEADING_RE = re.compile(r"^(#{1,6})\s+(.*)$")
BULLET_RE = re.compile(r"^\s*([-*+])\s+(.*)$")
CHECKBOX_RE = re.compile(r"^\s*[-*+]\s+\[( |x|X)\]\s+(.*)$")
ORDERED_RE = re.compile(r"^\s*(\d+)\.\s+(.*)$")
FENCE_RE = re.compile(r"^\s*```")


@dataclass
class Step:
    title: str
    items: List[str] = field(default_factory=list)
    notes: List[str] = field(default_factory=list)


def read_text(input_path: str) -> str:
    if input_path == "-":
        return sys.stdin.read()
    return Path(input_path).read_text(encoding="utf-8")


def strip_code_fences(lines: Iterable[str]) -> List[str]:
    cleaned: List[str] = []
    in_fence = False
    for line in lines:
        if FENCE_RE.match(line):
            in_fence = not in_fence
            continue
        if not in_fence:
            cleaned.append(line)
    return cleaned


def extract_title(lines: List[str], fallback: str) -> str:
    for line in lines:
        match = HEADING_RE.match(line)
        if match and len(match.group(1)) == 1:
            return match.group(2).strip()
    return fallback


def collect_steps_from_headings(lines: List[str], step_level: int) -> List[Step]:
    steps: List[Step] = []
    current: Optional[Step] = None
    current_level: Optional[int] = None

    def is_new_step(line: str) -> Optional[str]:
        match = HEADING_RE.match(line)
        if not match:
            return None
        level = len(match.group(1))
        if level == step_level:
            return match.group(2).strip()
        return None

    def heading_level(line: str) -> Optional[int]:
        match = HEADING_RE.match(line)
        if not match:
            return None
        return len(match.group(1))

    for raw in lines:
        line = raw.rstrip("\n")

        title = is_new_step(line)
        if title is not None:
            if current is not None:
                steps.append(current)
            current = Step(title=title)
            current_level = step_level
            continue

        if current is None:
            continue

        lvl = heading_level(line)
        if lvl is not None and current_level is not None and lvl <= current_level:
            steps.append(current)
            current = None
            current_level = None
            continue

        checkbox = CHECKBOX_RE.match(line)
        if checkbox:
            checked = checkbox.group(1).strip().lower() == "x"
            text = checkbox.group(2).strip()
            prefix = "[x]" if checked else "[ ]"
            current.items.append(f"{prefix} {text}")
            continue

        bullet = BULLET_RE.match(line)
        if bullet:
            current.items.append(bullet.group(2).strip())
            continue

        ordered = ORDERED_RE.match(line)
        if ordered:
            current.items.append(ordered.group(2).strip())
            continue

        if line.strip():
            current.notes.append(line.strip())

    if current is not None:
        steps.append(current)

    return steps


def collect_steps_from_top_level_lists(lines: List[str]) -> List[Step]:
    steps: List[Step] = []
    for raw in lines:
        line = raw.rstrip("\n")

        checkbox = CHECKBOX_RE.match(line)
        if checkbox:
            checked = checkbox.group(1).strip().lower() == "x"
            text = checkbox.group(2).strip()
            title = f"{('[x]' if checked else '[ ]')} {text}"
            steps.append(Step(title=title))
            continue

        bullet = BULLET_RE.match(line)
        if bullet:
            steps.append(Step(title=bullet.group(2).strip()))
            continue

        ordered = ORDERED_RE.match(line)
        if ordered:
            steps.append(Step(title=ordered.group(2).strip()))
            continue

    return steps


def choose_steps(lines: List[str]) -> List[Step]:
    steps_h3 = collect_steps_from_headings(lines, step_level=3)
    if steps_h3:
        return steps_h3

    steps_h2 = collect_steps_from_headings(lines, step_level=2)
    if steps_h2:
        return steps_h2

    return collect_steps_from_top_level_lists(lines)


def render(title: str, steps: List[Step]) -> str:
    out: List[str] = []
    out.append(f"# 작업명세서: {title}".rstrip())
    out.append("")
    out.append("## 작업 스텝")
    out.append("")

    if not steps:
        out.append("- (추출된 작업 스텝이 없습니다. 입력 문서의 헤딩/불릿 구조를 확인하세요.)")
        out.append("")
        return "\n".join(out)

    for i, step in enumerate(steps, start=1):
        out.append(f"### {i}. {step.title}")
        out.append("")

        if step.items:
            out.append("#### 작업 내용")
            for item in step.items:
                out.append(f"- {item}")
            out.append("")

        if step.notes:
            compact = " ".join(step.notes).strip()
            if compact:
                out.append("#### 비고")
                out.append(compact)
                out.append("")

    return "\n".join(out).rstrip() + "\n"


def parse_args(argv: List[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Convert Markdown to a work specification.")
    parser.add_argument("input", help="Input markdown file path, or '-' for stdin")
    parser.add_argument("-o", "--output", help="Write output to this file path")
    parser.add_argument("--title", help="Override document title")
    return parser.parse_args(argv)


def main(argv: List[str]) -> int:
    args = parse_args(argv)

    raw_text = read_text(args.input)
    lines = strip_code_fences(raw_text.splitlines(keepends=True))

    fallback_title = "(제목 없음)"
    title = args.title.strip() if args.title else extract_title(lines, fallback=fallback_title)
    steps = choose_steps(lines)

    output_text = render(title=title, steps=steps)

    if args.output:
        Path(args.output).write_text(output_text, encoding="utf-8")
    else:
        sys.stdout.write(output_text)

    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
