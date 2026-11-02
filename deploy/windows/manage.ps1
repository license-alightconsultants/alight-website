# Day-to-day control of the website.
#   powershell -ExecutionPolicy Bypass -File manage.ps1 status|start|stop|restart|logs
param([Parameter(Mandatory = $true)][ValidateSet('status', 'start', 'stop', 'restart', 'logs')][string]$Action)

. "$PSScriptRoot\common.ps1"
Import-AlightEnv

switch ($Action) {
    'start'   { Start-AlightApp; if (Test-AlightHealth) { 'Running' } else { Write-Warning 'Not responding yet - see logs' } }
    'stop'    { Stop-AlightApp; 'Stopped' }
    'restart' { Stop-AlightApp; Start-AlightApp; if (Test-AlightHealth) { 'Running' } else { Write-Warning 'Not responding yet - see logs' } }
    'logs'    { $f = Get-ChildItem $Paths.Logs -Filter 'app-*.log' | Sort-Object LastWriteTime | Select-Object -Last 1; if ($f) { Get-Content $f.FullName -Tail 80 } else { 'No logs yet' } }
    'status'  {
        $task = Get-ScheduledTask -TaskName $AppTaskName -ErrorAction SilentlyContinue
        "Task:     $(if ($task) { $task.State } else { 'not installed' })"
        "Node:     $(@(Get-AppNodeProcesses).Count) process(es)"
        "Health:   $(if (Test-AlightHealth 5) { 'OK (HTTP 200 on 127.0.0.1:' + $env:PORT + ')' } else { 'NOT RESPONDING' })"
        "Database: $((Get-PgUrl) -replace ':[^:@/]*@', ':***@')"
        $last = Get-ChildItem $Paths.Backups -Directory -ErrorAction SilentlyContinue | Sort-Object Name | Select-Object -Last 1
        "Backup:   $(if ($last) { $last.Name } else { 'none yet' })"
    }
}
