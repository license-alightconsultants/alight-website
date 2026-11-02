# Restores a backup made by backup.ps1. Stops the site, takes a safety dump of the current database
# (alight.pre-restore-<time>.dump in the backup folder) and keeps current uploads as *.pre-restore-<time>,
# restores, and restarts. A restore can therefore itself be undone.
# Usage:  powershell -ExecutionPolicy Bypass -File restore.ps1 -Backup D:\Alight\backups\20261031-020000
#         add -SkipUploads to restore only the database.
param(
    [Parameter(Mandatory = $true)][string]$Backup,
    [switch]$SkipUploads
)

. "$PSScriptRoot\common.ps1"
Import-AlightEnv
$url = Get-PgUrl
$pgDump = Get-PgTool 'pg_dump'
$pgRestore = Get-PgTool 'pg_restore'
$srcDump = Join-Path $Backup 'alight.dump'
if (-not (Test-Path $srcDump)) { throw "No alight.dump in $Backup" }

Write-Step 'Verifying backup'
& $pgRestore --list $srcDump | Out-Null
if ($LASTEXITCODE) { throw 'Backup dump is unreadable - not restoring.' }

$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
Write-Step 'Stopping the website'
Stop-AlightApp

try {
    $safety = Join-Path $Backup "alight.pre-restore-$stamp.dump"
    Write-Step "Saving current database as $safety"
    & $pgDump --format=custom --no-owner --no-privileges --file=$safety --dbname=$url
    if ($LASTEXITCODE) { throw 'Could not dump the current database - not restoring.' }

    Write-Step 'Restoring database'
    & $pgRestore --clean --if-exists --no-owner --no-privileges --single-transaction --dbname=$url $srcDump
    if ($LASTEXITCODE) { throw "pg_restore failed (transaction rolled back; database unchanged). Safety dump: $safety" }

    $zip = Join-Path $Backup 'uploads.zip'
    if (-not $SkipUploads -and (Test-Path $zip)) {
        $uploads = if ($env:UPLOAD_DIR) { $env:UPLOAD_DIR } else { $Paths.Uploads }
        if (Test-Path $uploads) {
            Write-Step "Keeping current uploads as $uploads.pre-restore-$stamp"
            Move-Item $uploads "$uploads.pre-restore-$stamp"
        }
        Expand-Archive -Path $zip -DestinationPath $uploads
    }
} finally {
    Write-Step 'Starting the website'
    Start-AlightApp
}

if (Test-AlightHealth) { Write-Step 'Restore complete - site is responding' }
else { Write-Warning "Site did not respond within 60 s. Check $($Paths.Logs)." }
