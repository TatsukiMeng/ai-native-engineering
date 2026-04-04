# Excalidraw Renderer

Project-local Excalidraw renderer for docs assets.

Default output uses a transparent background so diagrams sit cleanly in dark mode. Use `--background white` only when the white canvas is part of the diagram itself.

## Setup

```bash
cd docs/scripts/excalidraw
UV_CACHE_DIR=.uv-cache uv sync
UV_CACHE_DIR=.uv-cache uv run playwright install chromium
```

## Usage

```bash
cd docs/scripts/excalidraw
UV_CACHE_DIR=.uv-cache uv run python render_excalidraw.py /absolute/path/to/file.excalidraw
```

Opaque background:

```bash
cd docs/scripts/excalidraw
UV_CACHE_DIR=.uv-cache uv run python render_excalidraw.py /absolute/path/to/file.excalidraw --background white
```

