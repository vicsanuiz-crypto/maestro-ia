# Maestro-IA stopper
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

Write-Host ""
Write-Host "  Maestro-IA - parando server..." -ForegroundColor Magenta

$pidFile = Join-Path $projectRoot ".maestro-server.pid"
if (Test-Path $pidFile) {
    $savedPid = (Get-Content $pidFile -Raw).Trim()
    if ($savedPid -match '^\d+$') {
        try { taskkill /PID $savedPid /T /F 2>&1 | Out-Null } catch {}
    }
    Remove-Item $pidFile -ErrorAction SilentlyContinue
}

$conn = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if ($conn) {
    foreach ($c in $conn) {
        try { Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue } catch {}
    }
}

Start-Sleep -Seconds 1
$still = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if ($still) {
    Write-Host "  [!] Puerto 3000 sigue activo. Matalo manual." -ForegroundColor Yellow
} else {
    Write-Host "  [OK] Server detenido." -ForegroundColor Green
}

Start-Sleep -Seconds 2
