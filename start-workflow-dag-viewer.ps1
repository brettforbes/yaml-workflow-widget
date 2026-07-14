# Start the SPEC-011 CLI Workflow vertical DAG viewer (Vite + Vue3).
# Does not modify or replace start.ps1 (template-iframe-widget).

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$App = Join-Path $Root "apps\workflow-dag-viewer"

if (-not (Test-Path $App)) {
  Write-Error "Missing apps/workflow-dag-viewer — run from repo root."
  exit 1
}

Set-Location $App

if (-not (Test-Path (Join-Path $App "node_modules"))) {
  Write-Host "Installing dependencies in apps/workflow-dag-viewer ..."
  npm install
}

Write-Host "Starting workflow-dag-viewer (Vite). Local URL is usually http://localhost:5173/"
npm run dev
