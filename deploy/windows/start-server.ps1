# Runs the production server and restarts it if it exits. Started by the "Alight Website"
# scheduled task at boot (see install-tasks.ps1); do not run the Next.js dev server in production.
# Output goes to D:\Alight\logs\app-YYYYMMDD.log (kept 30 days).

. "$PSScriptRoot\common.ps1"
$ErrorActionPreference = 'Continue'
Import-AlightEnv
New-Item -ItemType Directory -Force -Path $Paths.Logs | Out-Null

$server = Join-Path $Paths.App 'server.js'
$node = (Get-Command node -ErrorAction Stop).Source
$failures = 0

while ($true) {
    $log = Join-Path $Paths.Logs ("app-{0:yyyyMMdd}.log" -f (Get-Date))
    Get-ChildItem $Paths.Logs -Filter 'app-*.log' | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-30) } | Remove-Item -Force
    Add-Content $log ("[{0:yyyy-MM-dd HH:mm:ss}] starting node on 127.0.0.1:{1}" -f (Get-Date), $env:PORT)

    $started = Get-Date
    # cmd handles the redirection so stdout/stderr are appended as plain text.
    & cmd.exe /d /c "`"$node`" `"$server`" >> `"$log`" 2>&1"
    $code = $LASTEXITCODE

    Add-Content $log ("[{0:yyyy-MM-dd HH:mm:ss}] node exited with code {1}" -f (Get-Date), $code)
    # Back off if it keeps crashing right after start (e.g. bad config), up to 60 s.
    if (((Get-Date) - $started).TotalSeconds -lt 30) { $failures++ } else { $failures = 0 }
    Start-Sleep -Seconds ([Math]::Min(60, 5 * [Math]::Max(1, $failures)))
}
