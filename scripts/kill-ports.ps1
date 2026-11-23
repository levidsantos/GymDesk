$ports = @(5173, 3001)
$found = $false

foreach ($port in $ports) {
  $conns = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
  foreach ($conn in $conns) {
    $proc = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
    if ($proc -and $proc.ProcessName -eq 'node') {
      Write-Host "Encerrando $($proc.ProcessName) (PID $($proc.Id)) na porta $port"
      Stop-Process -Id $proc.Id -Force
      $found = $true
    }
  }
}

if (-not $found) {
  Write-Host "Nenhum processo node encontrado nas portas $($ports -join ', ')."
}

Write-Host "Portas liberadas."
