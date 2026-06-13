# Refresca feed y regenera briefing del dia (idempotente).
# Llamado en background por el launcher cada vez que arrancas la app.
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

$logPath = Join-Path $projectRoot ".maestro-refresh.log"
"=== Refresh iniciado $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') ===" | Out-File $logPath -Encoding ascii

try {
    "[ingest] ejecutando..." | Out-File $logPath -Encoding ascii -Append
    npm run ingest 2>&1 | Out-File $logPath -Encoding ascii -Append
    "[ingest] OK" | Out-File $logPath -Encoding ascii -Append
} catch {
    "[ingest] ERROR: $_" | Out-File $logPath -Encoding ascii -Append
}

try {
    "[briefing] ejecutando..." | Out-File $logPath -Encoding ascii -Append
    npm run briefing 2>&1 | Out-File $logPath -Encoding ascii -Append
    "[briefing] OK" | Out-File $logPath -Encoding ascii -Append
} catch {
    "[briefing] ERROR: $_" | Out-File $logPath -Encoding ascii -Append
}

"=== Refresh terminado $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') ===" | Out-File $logPath -Encoding ascii -Append
