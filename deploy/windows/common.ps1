# Shared settings for the Alight deployment scripts. Dot-source it: . "$PSScriptRoot\common.ps1"
# Override the root with the ALIGHT_ROOT environment variable if you do not use D:\Alight.

$ErrorActionPreference = 'Stop'

$Root = if ($env:ALIGHT_ROOT) { $env:ALIGHT_ROOT } else { 'D:\Alight' }
$Paths = @{
    Root    = $Root
    Source  = Join-Path $Root 'source'    # project checkout (built here)
    App     = Join-Path $Root 'app'       # running release (replaced on every deploy)
    Data    = Join-Path $Root 'data'      # persistent: database + uploads (never inside app)
    Db      = Join-Path $Root 'data\db'
    Uploads = Join-Path $Root 'data\uploads'
    Config  = Join-Path $Root 'config'
    EnvFile = Join-Path $Root 'config\alight.env'
    Logs    = Join-Path $Root 'logs'
    Backups = Join-Path $Root 'backups'
}

$AppTaskName    = 'Alight Website'
$BackupTaskName = 'Alight Backup'

function Write-Step($msg) { Write-Host "==> $msg" -ForegroundColor Cyan }

# Loads KEY=VALUE lines from the env file into this process (comments and blank lines ignored,
# surrounding quotes removed). Secrets stay in this file, never in the deploy folder or IIS config.
function Import-AlightEnv {
    if (-not (Test-Path $Paths.EnvFile)) { throw "Missing $($Paths.EnvFile). Copy deploy\windows\alight.env.example there and fill it in." }
    foreach ($line in Get-Content -LiteralPath $Paths.EnvFile) {
        $t = $line.Trim()
        if (-not $t -or $t.StartsWith('#')) { continue }
        $i = $t.IndexOf('=')
        if ($i -lt 1) { continue }
        $key = $t.Substring(0, $i).Trim()
        $val = $t.Substring($i + 1).Trim()
        if ($val.Length -ge 2 -and (($val[0] -eq '"' -and $val[-1] -eq '"') -or ($val[0] -eq "'" -and $val[-1] -eq "'"))) {
            $val = $val.Substring(1, $val.Length - 2)
        }
        [Environment]::SetEnvironmentVariable($key, $val, 'Process')
    }
    $env:NODE_ENV = 'production'
    if (-not $env:PORT) { $env:PORT = '3000' }
    # Only IIS on this machine may reach Node; never expose this port publicly.
    $env:HOSTNAME = '127.0.0.1'
}

# Full path of a PostgreSQL client tool (pg_dump, pg_restore, psql). Looks in PG_BIN first, then PATH,
# then the newest "C:\Program Files\PostgreSQL\<ver>\bin".
function Get-PgTool([string]$Name) {
    if ($env:PG_BIN) {
        $p = Join-Path $env:PG_BIN "$Name.exe"
        if (Test-Path $p) { return $p }
    }
    $cmd = Get-Command $Name -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }
    $found = Get-ChildItem 'C:\Program Files\PostgreSQL\*\bin' -Filter "$Name.exe" -ErrorAction SilentlyContinue |
        Sort-Object { [int]($_.Directory.Parent.Name -replace '\D', '') } -Descending | Select-Object -First 1
    if ($found) { return $found.FullName }
    throw "$Name.exe not found. Install the PostgreSQL client tools or set PG_BIN in alight.env."
}

# DATABASE_URL without Prisma-only query parameters (e.g. ?schema=public), for pg_dump / pg_restore / psql.
function Get-PgUrl {
    if (-not $env:DATABASE_URL) { Import-AlightEnv }
    if ($env:DATABASE_URL -notmatch '^postgres(ql)?://') { throw "DATABASE_URL must be a postgresql:// URL (got '$($env:DATABASE_URL -replace ':[^:@/]*@', ':***@')')." }
    $u = $env:DATABASE_URL
    $q = $u.IndexOf('?')
    if ($q -ge 0) {
        $keep = $u.Substring($q + 1).Split('&') | Where-Object { $_ -and $_ -notmatch '^(schema|connection_limit|pool_timeout|pgbouncer|statement_cache_size)=' }
        $u = $u.Substring(0, $q) + $(if ($keep) { '?' + ($keep -join '&') } else { '' })
    }
    return $u
}

# Node processes running the release (started by start-server.ps1).
function Get-AppNodeProcesses {
    $server = Join-Path $Paths.App 'server.js'
    Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" |
        Where-Object { $_.CommandLine -and $_.CommandLine.Contains($server) }
}

function Stop-AlightApp {
    if (Get-ScheduledTask -TaskName $AppTaskName -ErrorAction SilentlyContinue) {
        Stop-ScheduledTask -TaskName $AppTaskName
    }
    Get-CimInstance Win32_Process -Filter "Name = 'powershell.exe'" |
        Where-Object { $_.CommandLine -and $_.CommandLine.Contains('start-server.ps1') } |
        ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
    Get-AppNodeProcesses | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
    Start-Sleep -Seconds 2
}

function Start-AlightApp {
    if (-not (Get-ScheduledTask -TaskName $AppTaskName -ErrorAction SilentlyContinue)) {
        throw "Scheduled task '$AppTaskName' not found - run install-tasks.ps1 first."
    }
    Start-ScheduledTask -TaskName $AppTaskName
}

function Test-AlightHealth([int]$TimeoutSec = 60) {
    if (-not $env:PORT) { $env:PORT = '3000' }
    $deadline = (Get-Date).AddSeconds($TimeoutSec)
    while ((Get-Date) -lt $deadline) {
        try {
            $r = Invoke-WebRequest -Uri "http://127.0.0.1:$($env:PORT)/" -UseBasicParsing -TimeoutSec 10
            if ($r.StatusCode -eq 200) { return $true }
        } catch { Start-Sleep -Seconds 2 }
    }
    return $false
}
