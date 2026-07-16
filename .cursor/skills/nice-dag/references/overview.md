# Overview

Source: `docs/intro.md`

## What Nice-DAG is

Lightweight JavaScript DAG presentation library. It uses **dagre** for layout, then goes further:

| dagre | Nice-DAG |
|-------|----------|
| Node position coordinates | DOM container for the diagram |
| | DOM hosts for nodes and edges |
| | Zoom in/out |
| | Mini-map |
| | Edit: drag nodes, connect edges, create/remove |

Developers focus on **rendering** nodes/edges and container placement/look-and-feel; Nice-DAG owns generic diagram behavior.

## Two views

1. **Read-only** — customize node/edge renderers; navigate (scale, center, minimap).
2. **Editable** — extends read-only with drag-and-drop, connect, create/remove.

## Architecture

- **`nice-dag-core`** — framework-agnostic DOM operations.
- Adaptors — **React** (`@ebay/nice-dag-react`) and **Vue3** (`@ebay/nice-dag-vue3`).

Prefer Vue3 paths in this skill unless the user asks for React.
