# --- CONFIG ---
$Root = Get-Location
$FrontendSrc = Join-Path $Root "react_pages"
$BackendSrc  = Join-Path $Root "login"
$DbSrc       = Join-Path $Root "DB"
$RootReqs    = Join-Path $Root "requirements.txt"

$FrontendDst = Join-Path $Root "frontend"
$BackendDst  = Join-Path $Root "backend"
$DbDst       = Join-Path $BackendDst "DB"

Write-Host "Root: $Root"

# 1) Create target folders if not exist
if (-not (Test-Path $FrontendDst)) { New-Item -ItemType Directory -Path $FrontendDst | Out-Null }
if (-not (Test-Path $BackendDst))  { New-Item -ItemType Directory -Path $BackendDst  | Out-Null }

# 2) Move react_pages -> frontend (rename directory)
if (Test-Path $FrontendSrc) {
    Write-Host "Moving react_pages -> frontend ..."
    # If frontend is empty, move entire folder. If not empty, move contents.
    if ((Get-ChildItem $FrontendDst -Force | Measure-Object).Count -eq 0) {
        Move-Item -Path $FrontendSrc -Destination $FrontendDst
    } else {
        Get-ChildItem -Path $FrontendSrc -Force | Move-Item -Destination $FrontendDst
        Remove-Item $FrontendSrc -Recurse -Force
    }
} else {
    Write-Warning "react_pages not found; skipping."
}

# 3) Move login -> backend (Flask app)
if (Test-Path $BackendSrc) {
    Write-Host "Moving login -> backend ..."
    Get-ChildItem -Path $BackendSrc -Force | Move-Item -Destination $BackendDst -Force
    Remove-Item $BackendSrc -Recurse -Force
} else {
    Write-Warning "login folder not found; skipping."
}

# 4) Move DB -> backend\DB
if (Test-Path $DbSrc) {
    Write-Host "Moving DB -> backend\DB ..."
    if (-not (Test-Path $DbDst)) { New-Item -ItemType Directory -Path $DbDst | Out-Null }
    Get-ChildItem -Path $DbSrc -Force | Move-Item -Destination $DbDst -Force
    Remove-Item $DbSrc -Recurse -Force
} else {
    Write-Warning "DB folder not found; skipping."
}

# 5) Move root requirements.txt to backend (if backend doesn't already have one)
$BackendReqs = Join-Path $BackendDst "requirements.txt"
if ((Test-Path $RootReqs) -and -not (Test-Path $BackendReqs)) {
    Write-Host "Moving requirements.txt -> backend\requirements.txt ..."
    Move-Item -Path $RootReqs -Destination $BackendReqs
}

# 6) Ensure a backend .env template (do not overwrite if exists)
$BackendEnv = Join-Path $BackendDst ".env"
if (-not (Test-Path $BackendEnv)) {
    Write-Host "Creating backend\.env template ..."
    @"
FLASK_APP=app.py
FLASK_DEBUG=1
# Update this to your actual Postgres if ready; dev fallback can be SQLite in code.
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/music
"@ | Out-File -FilePath $BackendEnv -Encoding UTF8 -NoNewline
}

# 7) Patch Vite proxy in frontend\vite.config.ts (only if /api proxy missing)
$ViteConfig = Join-Path $FrontendDst "vite.config.ts"
if (Test-Path $ViteConfig) {
    $viteText = Get-Content $ViteConfig -Raw
    if ($viteText -notmatch "/api") {
        Write-Host "Adding dev proxy to frontend\vite.config.ts ..."
        # naive insert: add server.proxy after plugins block
        $patched = $viteText -replace "(export default defineConfig\(\{\s*plugins:\s*\[react\(\)\],?)",
@"
`$1
  server: {
    proxy: {
      '/api': 'http://localhost:5000'
    }
  },
"@
        $patched | Set-Content $ViteConfig -Encoding UTF8
    } else {
        Write-Host "vite.config.ts already mentions /api; leaving as-is."
    }
} else {
    Write-Warning "frontend\vite.config.ts not found; skipping proxy patch."
}

Write-Host "`n=== Done ==="
Write-Host "New layout:"
Write-Host "  backend\   (Flask app, DB, requirements, .env)"
Write-Host "  frontend\  (React app)"
