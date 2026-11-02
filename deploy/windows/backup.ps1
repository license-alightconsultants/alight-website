# Backs up the PostgreSQL database (pg_dump custom format, consistent while the site runs) and uploaded
# images to D:\Alight\backups\<yyyyMMdd-HHmmss>\ and deletes backups older than BACKUP_RETENTION_DAYS (default 30).
# Copy D:\Alight\backups to another machine/disk regularly.
# Usage:  powershell -ExecutionPolicy Bypass -File backup.ps1 [-Label before-deploy]
param([string]$Label = '')

. "$PSScriptRoot\common.ps1"
Import-AlightEnv
$url = Get-PgUrl
$pgDump = Get-PgTool 'pg_dump'
$pgRestore = Get-PgTool 'pg_restore'

$name = (Get-Date -Format 'yyyyMMdd-HHmmss') + $(if ($Label) { "-$Label" } else { '' })
$dest = Join-Path $Paths.Backups $name
New-Item -ItemType Directory -Force -Path $dest | Out-Null
$log = Join-Path $Paths.Logs 'backup.log'
New-Item -ItemType Directory -Force -Path $Paths.Logs | Out-Null

try {
    $dump = Join-Path $dest 'alight.dump'
    Write-Step "Database dump -> $dump"
    & $pgDump --format=custom --no-owner --no-privileges --file=$dump --dbname=$url
    if ($LASTEXITCODE) { throw 'pg_dump failed' }
    # Reading the archive's table of contents proves the file is complete and readable.
    & $pgRestore --list $dump | Out-Null
    if ($LASTEXITCODE) { throw 'dump file failed verification' }

    $uploads = if ($env:UPLOAD_DIR) { $env:UPLOAD_DIR } else { $Paths.Uploads }
    if ((Test-Path $uploads) -and (Get-ChildItem $uploads -Recurse -File | Select-Object -First 1)) {
        Write-Step 'Archiving uploads'
        Compress-Archive -Path (Join-Path $uploads '*') -DestinationPath (Join-Path $dest 'uploads.zip') -CompressionLevel Optimal
    }

    $days = if ($env:BACKUP_RETENTION_DAYS) { [int]$env:BACKUP_RETENTION_DAYS } else { 30 }
    Get-ChildItem $Paths.Backups -Directory | Where-Object { $_.CreationTime -lt (Get-Date).AddDays(-$days) } |
        ForEach-Object { Remove-Item $_.FullName -Recurse -Force }

    Add-Content $log ("[{0:yyyy-MM-dd HH:mm:ss}] OK {1}" -f (Get-Date), $dest)
    Write-Step 'Backup complete'
} catch {
    Add-Content $log ("[{0:yyyy-MM-dd HH:mm:ss}] FAILED {1}: {2}" -f (Get-Date), $dest, $_)
    throw
}
