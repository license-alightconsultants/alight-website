# Registers the scheduled tasks (run as Administrator, once):
#   "Alight Website" - starts the Node server at boot, restarts it if the task stops.
#   "Alight Backup"  - nightly database + uploads backup at 02:00.
# Both run as SYSTEM so they work without anyone signed in.
param([string]$BackupTime = '02:00')

. "$PSScriptRoot\common.ps1"
$ps = Join-Path $env:windir 'System32\WindowsPowerShell\v1.0\powershell.exe'
$scripts = Join-Path $Paths.Root 'scripts'

# The tasks run copies of these scripts from D:\Alight\scripts so a new source checkout cannot break them mid-run.
Write-Step "Copying scripts to $scripts"
New-Item -ItemType Directory -Force -Path $scripts | Out-Null
Copy-Item "$PSScriptRoot\*.ps1", "$PSScriptRoot\*.cjs" $scripts -Force

$principal = New-ScheduledTaskPrincipal -UserId 'SYSTEM' -LogonType ServiceAccount -RunLevel Highest

Write-Step "Registering '$AppTaskName'"
$action = New-ScheduledTaskAction -Execute $ps -Argument "-NoProfile -NonInteractive -ExecutionPolicy Bypass -File `"$scripts\start-server.ps1`"" -WorkingDirectory $Paths.App
$settings = New-ScheduledTaskSettingsSet -ExecutionTimeLimit ([TimeSpan]::Zero) -RestartCount 999 -RestartInterval (New-TimeSpan -Minutes 1) `
    -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -MultipleInstances IgnoreNew
Register-ScheduledTask -TaskName $AppTaskName -Action $action -Trigger (New-ScheduledTaskTrigger -AtStartup) `
    -Principal $principal -Settings $settings -Description 'Alight Consultants website (Next.js on 127.0.0.1)' -Force | Out-Null

Write-Step "Registering '$BackupTaskName' daily at $BackupTime"
$action = New-ScheduledTaskAction -Execute $ps -Argument "-NoProfile -NonInteractive -ExecutionPolicy Bypass -File `"$scripts\backup.ps1`""
$settings = New-ScheduledTaskSettingsSet -ExecutionTimeLimit (New-TimeSpan -Hours 1) -StartWhenAvailable -AllowStartIfOnBatteries
Register-ScheduledTask -TaskName $BackupTaskName -Action $action -Trigger (New-ScheduledTaskTrigger -Daily -At $BackupTime) `
    -Principal $principal -Settings $settings -Description 'Alight Consultants database and uploads backup' -Force | Out-Null

Write-Step 'Tasks registered. Start the site with:  Start-ScheduledTask -TaskName "Alight Website"'
