# One-time IIS configuration (run as Administrator after installing URL Rewrite and ARR).
# Creates the IIS site (HTTP binding only - add the HTTPS binding with your certificate afterwards,
# see docs\DEPLOYMENT.md) and configures ARR as a reverse proxy for the Node server.
# Usage:  powershell -ExecutionPolicy Bypass -File setup-iis.ps1 -HostName alightconsultants.in
param(
    [Parameter(Mandatory = $true)][string]$HostName,
    [string]$SiteName = 'Alight Website'
)

. "$PSScriptRoot\common.ps1"
$appcmd = Join-Path $env:windir 'System32\inetsrv\appcmd.exe'
if (-not (Test-Path $appcmd)) { throw 'IIS is not installed (appcmd.exe not found).' }
function AppCmd { & $appcmd @args; if ($LASTEXITCODE) { throw "appcmd $($args -join ' ') failed" } }

$hasRewrite = Test-Path (Join-Path $env:windir 'System32\inetsrv\rewrite.dll')
$hasArr = Test-Path (Join-Path ${env:ProgramFiles} 'IIS\Application Request Routing')
if (-not $hasRewrite) { throw 'Install IIS URL Rewrite 2.1 first: https://www.iis.net/downloads/microsoft/url-rewrite' }
if (-not $hasArr) { throw 'Install Application Request Routing 3.0 first: https://www.iis.net/downloads/microsoft/application-request-routing' }

Write-Step 'Enabling ARR proxy'
# preserveHostHeader: Next.js compares Origin with Host for form posts and server actions.
# responseBufferLimit 0: stream responses (React Server Components) instead of buffering them.
AppCmd set config -section:system.webServer/proxy /enabled:"True" /preserveHostHeader:"True" /reverseRewriteHostInResponseHeaders:"False" /responseBufferLimit:"0" /timeout:"00:02:00" /commit:apphost

Write-Step 'Creating folders'
foreach ($p in $Paths.App, $Paths.Db, $Paths.Uploads, $Paths.Config, $Paths.Logs, $Paths.Backups) { New-Item -ItemType Directory -Force -Path $p | Out-Null }

$existing = & $appcmd list site /name:"$SiteName"
if (-not $existing) {
    Write-Step "Creating IIS site '$SiteName' -> $($Paths.App)"
    AppCmd add apppool /name:"$SiteName" /managedRuntimeVersion:"" /startMode:"AlwaysRunning"
    AppCmd add site /name:"$SiteName" /physicalPath:"$($Paths.App)" /bindings:"http/*:80:$HostName,http/*:80:www.$HostName"
    AppCmd set app "$SiteName/" /applicationPool:"$SiteName"
} else {
    Write-Step "Site '$SiteName' already exists - leaving bindings unchanged"
}

Write-Step 'Allowing forwarded-header server variables'
foreach ($v in 'HTTP_X_FORWARDED_FOR', 'HTTP_X_FORWARDED_PROTO', 'HTTP_X_FORWARDED_HOST') {
    & $appcmd set config "$SiteName" -section:system.webServer/rewrite/allowedServerVariables /+"[name='$v']" /commit:apphost 2>$null | Out-Null
}

Write-Step 'Done. Next: add the HTTPS binding (docs\DEPLOYMENT.md, step 5).'
