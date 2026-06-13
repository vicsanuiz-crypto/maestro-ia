# Maestro-IA - arranque automatico del servidor de desarrollo
# Este script lo lanza Windows al iniciar sesion (acceso en la carpeta Inicio).

$proj = 'C:\Users\Asus\.claude\Proyectos\Maestro-IA'
Set-Location $proj

# 1) Cerrar cualquier servidor Maestro-IA que ya estuviera corriendo (evita duplicados y cache corrupta)
Get-CimInstance Win32_Process -Filter "Name='node.exe'" -ErrorAction SilentlyContinue |
  Where-Object { $_.CommandLine -like '*Maestro-IA*next*' } |
  ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
Start-Sleep -Seconds 2

# 2) Quitar la variable ANTHROPIC_API_KEY vacia si viniera heredada (para que lea la clave del .env.local)
Remove-Item Env:ANTHROPIC_API_KEY -ErrorAction SilentlyContinue

# 3) Arrancar el servidor
Write-Host 'Maestro-IA: servidor automatico en http://localhost:3000' -ForegroundColor Green
Write-Host 'NO cierres esta ventana mientras uses la aplicacion.' -ForegroundColor Yellow
npm run dev
