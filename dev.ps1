# dev.ps1 — run the OpenCode fork with isolated data directories.
# Keeps the fork's dev data separate from the installed `opencode` CLI
# (which otherwise shares ~/.local/share/opencode: opencode.db / auth.json / sessions).

$ErrorActionPreference = "Stop"

# Ensure bun is on PATH
$bunBin = Join-Path $env:USERPROFILE ".bun\bin"
if (Test-Path (Join-Path $bunBin "bun.exe")) {
  $env:PATH = "$bunBin;$env:PATH"
}

# --- Data isolation ---
# Override via $env:OPENCODE_DEV_DATA if you want a different root.
$devRoot = if ($env:OPENCODE_DEV_DATA) { $env:OPENCODE_DEV_DATA } else { "E:\opencode-dev" }
$env:XDG_DATA_HOME   = Join-Path $devRoot "data"
$env:XDG_CONFIG_HOME = Join-Path $devRoot "config"
$env:XDG_CACHE_HOME  = Join-Path $devRoot "cache"
$env:XDG_STATE_HOME  = Join-Path $devRoot "state"

foreach ($dir in $env:XDG_DATA_HOME, $env:XDG_CONFIG_HOME, $env:XDG_CACHE_HOME, $env:XDG_STATE_HOME) {
  New-Item -ItemType Directory -Path $dir -Force | Out-Null
}

Write-Host "[dev] isolated data root: $devRoot"

if ($args.Count -eq 0) {
  Write-Host "Usage: .\dev.ps1 <bun args...>"
  Write-Host "  e.g.  .\dev.ps1 dev serve --port 4096"
  Write-Host "        .\dev.ps1 run --cwd packages/app dev"
  exit 1
}

& bun @args
exit $LASTEXITCODE
