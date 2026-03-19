$services = @(
    @{ Name = "backblaze-upload"; Script = "if (!(Test-Path node_modules)) { Write-Host 'Installing dependencies...'; npm install }; npm start" },
    @{ Name = "backend"; Script = "if (!(Test-Path node_modules)) { Write-Host 'Installing dependencies...'; npm install }; npm start" },
    @{ Name = "frontend"; Script = "if (!(Test-Path node_modules)) { Write-Host 'Installing dependencies...'; npm install }; npm start" },
    @{ Name = "torrent"; Script = "if (!(Test-Path node_modules)) { Write-Host 'Installing dependencies...'; npm install }; npm run build; npm start" },
    @{ Name = "tracker"; Script = "if (!(Test-Path node_modules)) { Write-Host 'Installing dependencies...'; npm install }; npm start" }
  
)

foreach ($service in $services) {
    Write-Host "Checking dependencies and starting $($service.Name)..."
    Start-Process powershell -WorkingDirectory "c:\Personal\Project\Project\Fastshare\$($service.Name)" -ArgumentList "-NoExit", "-Command", "Title $($service.Name); $($service.Script)"
}
Write-Host "All services (ignoring desktop-torrent) started in separate windows."
