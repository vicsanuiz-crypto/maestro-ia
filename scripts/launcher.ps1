# Maestro-IA launcher
$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

$port = 3000
$url = "http://localhost:$port"

function Test-ServerUp {
    try {
        $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        return $r.StatusCode -eq 200
    } catch { return $false }
}

Write-Host ""
Write-Host "  Maestro-IA" -ForegroundColor Magenta
Write-Host "  ----------" -ForegroundColor DarkGray
Write-Host ""

if (Test-ServerUp) {
    Write-Host "  [OK] Server ya activo en $url" -ForegroundColor Green
    Start-Process $url
    Start-Sleep -Seconds 1
    exit 0
}

if (-not (Test-Path ".env.local")) {
    Write-Host "  [!] Falta .env.local. Creando placeholder..." -ForegroundColor Yellow
    "ANTHROPIC_API_KEY=sk-ant-placeholder-set-your-key`nDATABASE_URL=./maestro.db" | Out-File ".env.local" -Encoding ascii -NoNewline
    Write-Host "      Edita .env.local y pon tu ANTHROPIC_API_KEY real." -ForegroundColor Yellow
}

if (-not (Test-Path "node_modules")) {
    Write-Host "  [.] Instalando dependencias (primera vez, ~2min)..." -ForegroundColor Cyan
    npm install --legacy-peer-deps --no-fund --no-audit
}

if (-not (Test-Path ".next\BUILD_ID")) {
    Write-Host "  [.] Generando build de produccion..." -ForegroundColor Cyan
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  [X] Build fallo. Revisa errores arriba." -ForegroundColor Red
        Read-Host "Pulsa Enter para cerrar"
        exit 1
    }
}

$logPath = Join-Path $projectRoot ".maestro-server.log"
Remove-Item $logPath -ErrorAction SilentlyContinue

Write-Host "  [.] Arrancando server en background..." -ForegroundColor Cyan
$proc = Start-Process -FilePath "cmd.exe" `
    -ArgumentList "/c", "npm run start > `"$logPath`" 2>&1" `
    -WindowStyle Hidden -PassThru

$proc.Id | Out-File ".maestro-server.pid" -Encoding ascii -NoNewline

Write-Host -NoNewline "  [.] Esperando respuesta del server"
$ready = $false
for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Seconds 1
    Write-Host -NoNewline "."
    if (Test-ServerUp) { $ready = $true; break }
}
Write-Host ""

if (-not $ready) {
    Write-Host "  [X] El server no respondio en 30s. Ultimas lineas del log:" -ForegroundColor Red
    if (Test-Path $logPath) { Get-Content $logPath -Tail 15 }
    Read-Host "Pulsa Enter para cerrar"
    exit 1
}

Write-Host "  [OK] Server activo en $url" -ForegroundColor Green

# Lanzar refresh de feed + briefing en background (no bloquea la apertura del navegador)
Write-Host "  [.] Refrescando feed y briefing en background..." -ForegroundColor DarkCyan
Start-Process -FilePath "powershell.exe" `
    -ArgumentList "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", "`"$projectRoot\scripts\refresh-content.ps1`"" `
    -WindowStyle Hidden | Out-Null

Write-Host "  Abriendo navegador..." -ForegroundColor DarkGray
Start-Process $url

Write-Host ""
Write-Host "  Para detener: doble clic en stop.cmd" -ForegroundColor DarkGray
Write-Host "  Log de refresh: .maestro-refresh.log" -ForegroundColor DarkGray
Start-Sleep -Seconds 2
