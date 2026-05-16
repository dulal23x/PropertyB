$portsToKill = @(8090, 3010)

Write-Host "Stopping Backend Server (Port 8090) and Frontend Server (Port 3010)..." -ForegroundColor Cyan

foreach ($port in $portsToKill) {
    try {
        $connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
        if ($connections) {
            $pids = $connections.OwningProcess | Select-Object -Unique
            foreach ($pid_ in $pids) {
                Write-Host "Killing process with PID $pid_ running on port $port..." -ForegroundColor Yellow
                Stop-Process -Id $pid_ -Force -ErrorAction SilentlyContinue
            }
        } else {
            Write-Host "No processes found listening on port $port." -ForegroundColor Green
        }
    } catch {
        Write-Host "An error occurred while trying to stop processes on port $port: $_" -ForegroundColor Red
    }
}

Write-Host "`nAll specified servers have been stopped." -ForegroundColor Cyan
