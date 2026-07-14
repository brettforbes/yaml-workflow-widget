# workflow-dag-viewer (SPEC-011)

Standalone Vite + Vue3 app that shows the real `12A` workflow YAML beside a vertical Nice-DAG diagram.

## Run

From repo root:

```powershell
.\start-workflow-dag-viewer.ps1
```

Or:

```powershell
cd apps\workflow-dag-viewer
npm install
npm run dev
```

Open the printed URL (usually http://localhost:5173/).

- Full page: code (left) + diagram (right)
- Hide YAML: toolbar toggle
- Embed: `?embed=1` (diagram only, ~4 columns wide)

Editing via tooltip → modal updates the in-memory node model only (no write-back to the YAML pane this phase).
