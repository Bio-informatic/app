$port = 8080
$url = "http://localhost:$port"

Write-Host "Starting Game Server on port $port..."
Start-Process python -ArgumentList "-m http.server $port" -WindowStyle Minimized

Write-Host "Opening Game in Browser..."
Start-Process $url

Write-Host "Game is running! Minimize this window to keep playing."
Write-Host "NOTE: To stop the server completely, you may need to close the minimized Python window."
Pause
