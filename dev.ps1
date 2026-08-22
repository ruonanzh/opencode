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
# Dev root resolution order (highest wins):
#   1. $env:OPENCODE_DEV_DATA          (explicit per-invocation override)
#   2. DEV_ROOT in <repo>\.env         (local copy; authoritative = docs repo .env)
#   3. hardcoded default               (fallback)
function Read-EnvFile([string]$path) {
  $map = @{}
  if (-not (Test-Path -LiteralPath $path)) { return $map }
  foreach ($line in Get-Content -LiteralPath $path) {
    $line = $line.Trim()
    if ($line -eq "" -or $line.StartsWith("#")) { continue }
    $idx = $line.IndexOf("=")
    if ($idx -le 0) { continue }
    $map[$line.Substring(0, $idx).Trim()] = $line.Substring($idx + 1).Trim()
  }
  return $map
}

$envFile = Join-Path $PSScriptRoot ".env"
$envDevRoot = (Read-EnvFile $envFile)["DEV_ROOT"]
if ($envDevRoot -and $envDevRoot.StartsWith("~")) {
  $envDevRoot = $env.USERPROFILE + $envDevRoot.Substring(1)
}

$devRoot = if ($env:OPENCODE_DEV_DATA) { $env:OPENCODE_DEV_DATA } elseif ($envDevRoot) { $envDevRoot } else { "D:\opencode-dev" }

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
