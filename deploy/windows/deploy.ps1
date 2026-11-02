# Builds and deploys a new version with a pre-deploy backup and automatic rollback.
# Run as Administrator from the source checkout (D:\Alight\source):
#   powershell -ExecutionPolicy Bypass -File deploy\windows\deploy.ps1
# Steps: build release -> backup -> stop -> migrate database -> swap app folder -> start -> health check.
param([switch]$SkipBuild)

. "$PSScriptRoot\common.ps1"
$SourceDir = (Resolve-Path "$PSScriptRoot\..\..").Path
$Release = Join-Path $SourceDir 'release'

if (-not $SkipBuild) { & "$PSScriptRoot\build-release.ps1" -SourceDir $SourceDir }
if (-not (Test-Path (Join-Path $Release 'server.js'))) { throw "No release found at $Release" }
Import-AlightEnv

Write-Step 'Backing up before deploy'
& "$PSScriptRoot\backup.ps1" -Label 'pre-deploy'

Write-Step 'Stopping the website'
Stop-AlightApp

Write-Step 'Applying database migrations'
Push-Location $SourceDir
try {
    & npx prisma migrate deploy
    if ($LASTEXITCODE) { throw 'prisma migrate deploy failed - site left stopped; restore the pre-deploy backup if needed.' }
} finally { Pop-Location }

Write-Step "Replacing $($Paths.App)"
$previous = "$($Paths.App).previous"
if (Test-Path $previous) { Remove-Item $previous -Recurse -Force }
if (Test-Path $Paths.App) { Rename-Item $Paths.App (Split-Path $previous -Leaf) }
Copy-Item $Release $Paths.App -Recurse

Start-AlightApp
if (Test-AlightHealth) {
    Write-Step 'Deploy complete - site is responding'
} else {
    Write-Warning 'New version did not respond within 60 s - rolling back to the previous app folder.'
    Stop-AlightApp
    Remove-Item $Paths.App -Recurse -Force
    Rename-Item $previous (Split-Path $Paths.App -Leaf)
    Start-AlightApp
    throw "Deploy failed and was rolled back. Check $($Paths.Logs). (Database migrations are not rolled back automatically.)"
}
