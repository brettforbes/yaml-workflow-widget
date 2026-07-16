# apps/nice-dag — vendored Nice-DAG library (SPEC-012 / F0-S1)

This directory is the **only** `apps/` package intended for product use after SPEC-012 layout migration.

It vendors published builds of:

| Package | Version | Path |
|---------|---------|------|
| `@ebay/nice-dag-core` | 1.0.45 | `nice-dag-core/` |
| `@ebay/nice-dag-vue3` | 1.0.33 | `nice-dag-vue3/` |

## Webpack resolution

Root [`webpack.common.js`](../../webpack.common.js) aliases:

```js
'@ebay/nice-dag-core' → apps/nice-dag/nice-dag-core
'@ebay/nice-dag-vue3' → apps/nice-dag/nice-dag-vue3
```

Prefer these aliases (or `file:` deps) over installing from npm into the root widget, so the iframe build stays pinned to this tree.

## Rebuild / refresh from npm

When you need a newer upstream release:

```powershell
# From repo root
npm pack @ebay/nice-dag-core@<version>
npm pack @ebay/nice-dag-vue3@<version>
# Extract tarballs into apps/nice-dag/nice-dag-core and apps/nice-dag/nice-dag-vue3
# (replace contents; keep this README)
```

Or copy from a clean install:

```powershell
npm install @ebay/nice-dag-core@1.0.45 @ebay/nice-dag-vue3@1.0.33 --prefix .tmp-nice-dag
robocopy .tmp-nice-dag\node_modules\@ebay\nice-dag-core apps\nice-dag\nice-dag-core /E /XD node_modules
robocopy .tmp-nice-dag\node_modules\@ebay\nice-dag-vue3 apps\nice-dag\nice-dag-vue3 /E /XD node_modules
Remove-Item -Recurse -Force .tmp-nice-dag
```

Then update the version table above.

## Peer dependencies

`@ebay/nice-dag-vue3` expects **Vue 3**. Install `vue` in the consuming app (root webpack widget after F0-S2, or interim Vite app until F0-S4).

## Do not

- Do not treat `apps/workflow-dag-viewer` as the Nice-DAG source of truth (retired in F0-S4).
- Do not modify `yaml-workflow-dag` product code for library updates; refresh from npm as above.
