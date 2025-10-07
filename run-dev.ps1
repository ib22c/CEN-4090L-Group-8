# Starts Flask (5000) and Vite (5173) side-by-side for development

$root = Get-Location

# --- Backend ---
$backend = Join-Path $root "backend"
$venv = Join-Path $backend "venv\Scripts\Activate.ps1"
$flaskCmd = "flask --app app.py run -p 5000"

Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-Command",
  "Set-Location `"$backend`"; if (Test-Path `"$venv`") { . `"$venv`" }; $env:FLASK_DEBUG='1'; $flaskCmd"
) -WorkingDirectory $backend

# --- Frontend ---
$frontend = Join-Path $root "frontend"
Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-Command",
  "Set-Location `"$frontend`"; npm run dev"
) -WorkingDirectory $frontend
