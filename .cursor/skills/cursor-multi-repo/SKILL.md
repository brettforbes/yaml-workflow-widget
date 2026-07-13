---
name: cursor-multi-repo
description: >-
  Work with multiple repositories in Cursor: multi-root workspaces, monorepo patterns,
  selective indexing, and cross-project context. Use when the user mentions multi-root
  workspace, multiple projects, monorepo, cross-repo context, spiderfeet and
  spiderfeet-widget, or workspace indexing.
---
# Cursor Multi-Repo

Work with multiple repositories and monorepo structures in Cursor. Covers multi-root workspaces, selective indexing, cross-project context, and rule inheritance patterns.

## This workspace

This multi-root workspace includes:

| Root folder | Role |
|-------------|------|
| `spiderfeet` | SpiderFoot fork — module analysis, governance, OSINT catalog |
| `spiderfeet-widget` | Widget / visualization front-end |

- Rules in each root are **independent** (`.cursor/rules/` does not cross roots).
- Use root-prefixed `@` paths when referencing files across roots (e.g. `@spiderfeet/.docs/...` and `@spiderfeet-widget/src/...`).
- Install the same skill in each root's `.cursor/skills/cursor-multi-repo/` so it is available from either folder.

## Quick start

- **Multiple repos in one window**: create or open a `.code-workspace` file with one folder entry per root. See [multi-root-workspace.md](references/multi-root-workspace.md).
- **Monorepo**: open the full root for cross-package work, or open a single package for faster indexing. See [monorepo-patterns.md](references/monorepo-patterns.md).
- **Slow or noisy search**: use `.cursorignore` and workspace exclusions to index only active packages. See [indexing-strategy.md](references/indexing-strategy.md).
- **Cross-root `@` mentions**: prefix with the workspace folder name (e.g. `@api-service/src/...`).

## Reference files

Read these when the task needs deeper detail:

| File | Contents |
|------|----------|
| [multi-root-workspace.md](references/multi-root-workspace.md) | Workspace file format, opening workspaces, cross-project `@` mentions, per-project rules |
| [monorepo-patterns.md](references/monorepo-patterns.md) | Monorepo layout, root vs package rules, focused opening |
| [indexing-strategy.md](references/indexing-strategy.md) | `.cursorignore`, selective indexing, workspace exclude patterns |
| [examples.md](references/examples.md) | Example requests and outcomes |
| [errors.md](references/errors.md) | Common errors and fixes |

## External resources

- [VS Code Multi-Root Workspaces](https://code.visualstudio.com/docs/editor/multi-root-workspaces)
- [Codebase Indexing](https://docs.cursor.com/context/codebase-indexing)
- [Cursor Rules](https://docs.cursor.com/context/rules)
