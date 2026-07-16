# Contribution / local development

Source: `docs/contribution/contribution.md`

## Setup

Mono-repo managed with **PNPM**.

```bash
pnpm install
pnpm build
```

Rebuild individual packages under `packages/` after local changes:

```bash
pnpm build
```

## Examples

```bash
cd example
pnpm start
```

Open `http://localhost:3100/home`.

## Debug

Workspace links `nice-dag-core` and adaptors into the example. After code changes, rebuild the touched package, then refresh the sample page.
