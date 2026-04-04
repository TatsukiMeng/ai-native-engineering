"""Render Excalidraw JSON to PNG for docs assets.

Usage:
    uv run python render_excalidraw.py path/to/file.excalidraw
    uv run python render_excalidraw.py path/to/file.excalidraw --background white
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path


def validate_excalidraw(data: dict) -> list[str]:
    errors: list[str] = []

    if data.get("type") != "excalidraw":
        errors.append(f"Expected type 'excalidraw', got '{data.get('type')}'")

    elements = data.get("elements")
    if elements is None:
        errors.append("Missing 'elements' array")
    elif not isinstance(elements, list):
        errors.append("'elements' must be an array")
    elif len(elements) == 0:
        errors.append("'elements' array is empty")

    return errors


def compute_bounding_box(elements: list[dict]) -> tuple[float, float, float, float]:
    min_x = float("inf")
    min_y = float("inf")
    max_x = float("-inf")
    max_y = float("-inf")

    for el in elements:
        if el.get("isDeleted"):
            continue

        x = el.get("x", 0)
        y = el.get("y", 0)
        w = el.get("width", 0)
        h = el.get("height", 0)

        if el.get("type") in ("arrow", "line") and "points" in el:
            for px, py in el["points"]:
                min_x = min(min_x, x + px)
                min_y = min(min_y, y + py)
                max_x = max(max_x, x + px)
                max_y = max(max_y, y + py)
        else:
            min_x = min(min_x, x)
            min_y = min(min_y, y)
            max_x = max(max_x, x + abs(w))
            max_y = max(max_y, y + abs(h))

    if min_x == float("inf"):
        return (0, 0, 800, 600)

    return (min_x, min_y, max_x, max_y)


def render(
    excalidraw_path: Path,
    output_path: Path | None = None,
    scale: int = 2,
    max_width: int = 1920,
    background: str = "transparent",
) -> Path:
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("ERROR: playwright not installed.", file=sys.stderr)
        print(
            "Run: UV_CACHE_DIR=.uv-cache uv sync && UV_CACHE_DIR=.uv-cache uv run playwright install chromium",
            file=sys.stderr,
        )
        sys.exit(1)

    raw = excalidraw_path.read_text(encoding="utf-8")
    try:
        data = json.loads(raw)
    except json.JSONDecodeError as exc:
        print(f"ERROR: Invalid JSON in {excalidraw_path}: {exc}", file=sys.stderr)
        sys.exit(1)

    errors = validate_excalidraw(data)
    if errors:
        print("ERROR: Invalid Excalidraw file:", file=sys.stderr)
        for err in errors:
            print(f"  - {err}", file=sys.stderr)
        sys.exit(1)

    elements = [e for e in data["elements"] if not e.get("isDeleted")]
    min_x, min_y, max_x, max_y = compute_bounding_box(elements)
    padding = 80
    diagram_w = max_x - min_x + padding * 2
    diagram_h = max_y - min_y + padding * 2

    vp_width = min(int(diagram_w), max_width)
    vp_height = max(int(diagram_h), 600)

    if output_path is None:
        output_path = excalidraw_path.with_suffix(".png")

    template_path = Path(__file__).with_name("render_template.html")
    if not template_path.exists():
        print(f"ERROR: Template not found at {template_path}", file=sys.stderr)
        sys.exit(1)

    template_url = template_path.as_uri()
    render_options = json.dumps({"background": background})

    with sync_playwright() as p:
        try:
            browser = p.chromium.launch(headless=True)
        except Exception as exc:
            if "Executable doesn't exist" not in str(exc) and "browserType.launch" not in str(exc):
                raise
            print("ERROR: Chromium not installed for Playwright.", file=sys.stderr)
            print(
                "Run: UV_CACHE_DIR=.uv-cache uv run playwright install chromium",
                file=sys.stderr,
            )
            sys.exit(1)

        page = browser.new_page(
            viewport={"width": vp_width, "height": vp_height},
            device_scale_factor=scale,
        )

        page.goto(template_url)
        page.wait_for_function("window.__moduleReady === true", timeout=30000)

        json_str = json.dumps(data)
        result = page.evaluate(f"window.renderDiagram({json_str}, {render_options})")
        if not result or not result.get("success"):
            error_msg = result.get("error", "Unknown render error") if result else "renderDiagram returned null"
            print(f"ERROR: Render failed: {error_msg}", file=sys.stderr)
            browser.close()
            sys.exit(1)

        page.wait_for_function("window.__renderComplete === true", timeout=15000)

        svg_el = page.query_selector("#root svg")
        if svg_el is None:
            print("ERROR: No SVG element found after render.", file=sys.stderr)
            browser.close()
            sys.exit(1)

        svg_el.screenshot(
            path=str(output_path),
            omit_background=(background == "transparent"),
        )
        browser.close()

    return output_path


def main() -> None:
    parser = argparse.ArgumentParser(description="Render Excalidraw JSON to PNG")
    parser.add_argument("input", type=Path, help="Path to .excalidraw JSON file")
    parser.add_argument("--output", "-o", type=Path, default=None, help="Output PNG path")
    parser.add_argument("--scale", "-s", type=int, default=2, help="Device scale factor")
    parser.add_argument("--width", "-w", type=int, default=1920, help="Max viewport width")
    parser.add_argument(
        "--background",
        choices=("transparent", "white"),
        default="transparent",
        help="Export background mode",
    )
    args = parser.parse_args()

    if not args.input.exists():
        print(f"ERROR: File not found: {args.input}", file=sys.stderr)
        sys.exit(1)

    png_path = render(
        args.input,
        output_path=args.output,
        scale=args.scale,
        max_width=args.width,
        background=args.background,
    )
    print(str(png_path))


if __name__ == "__main__":
    main()
