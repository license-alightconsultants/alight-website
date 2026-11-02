# Builds a production release into <source>\release without touching the running site.
# Usage:  powershell -ExecutionPolicy Bypass -File deploy\windows\build-release.ps1
param([string]$SourceDir, [switch]$SkipInstall)

. "$PSScriptRoot\common.ps1"
if (-not $SourceDir) { $SourceDir = (Resolve-Path "$PSScriptRoot\..\..").Path }
$Release = Join-Path $SourceDir 'release'

Import-AlightEnv   # NEXT_PUBLIC_* values are compiled into the build
Push-Location $SourceDir
try {
    if (-not $SkipInstall) {
        Write-Step 'Installing dependencies (npm ci)'
        & npm ci --no-audit --no-fund
        if ($LASTEXITCODE) { throw 'npm ci failed' }
    }

    Write-Step 'Generating Prisma client'
    & npx prisma generate
    if ($LASTEXITCODE) { throw 'prisma generate failed' }

    Write-Step 'Building Next.js (standalone)'
    if (Test-Path .next) { Remove-Item .next -Recurse -Force }
    & npx next build
    if ($LASTEXITCODE) { throw 'next build failed' }

    Write-Step "Assembling $Release"
    if (Test-Path $Release) { Remove-Item $Release -Recurse -Force }
    Copy-Item .next\standalone $Release -Recurse
    Copy-Item .next\static (Join-Path $Release '.next\static') -Recurse
    Copy-Item public (Join-Path $Release 'public') -Recurse
    # Secrets come from D:\Alight\config\alight.env at runtime; never ship local env files or dev data.
    Get-ChildItem $Release -Filter '.env*' -Force | Remove-Item -Force
    foreach ($d in 'data', 'release') { $p = Join-Path $Release $d; if (Test-Path $p) { Remove-Item $p -Recurse -Force } }
    $cache = Join-Path $Release '.next\cache'; if (Test-Path $cache) { Remove-Item $cache -Recurse -Force }
    Copy-Item "$PSScriptRoot\web.config" (Join-Path $Release 'web.config')
    Set-Content -Path (Join-Path $Release 'RELEASE.txt') -Value ("Built {0:yyyy-MM-dd HH:mm} from {1}" -f (Get-Date), $SourceDir) -Encoding ASCII

    Write-Step 'Release ready'
} finally { Pop-Location }
