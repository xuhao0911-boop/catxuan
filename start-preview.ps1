param(
    [switch]$NoBrowser,
    [switch]$NoStart,
    [ValidateRange(1024, 65535)][int]$Port = 4179,
    [ValidateRange(5, 30)][int]$StartupTimeoutSeconds = 20
)

$ErrorActionPreference = 'Stop'
$canisProjectRoot = $PSScriptRoot
$canisBaseUrl = 'http://127.0.0.1:' + $Port
$canisPreviewUrl = $canisBaseUrl + '/?v=0.1'

function Test-CanisPreview {
    try {
        $canisHealth = Invoke-RestMethod -Uri ($canisBaseUrl + '/api/health') -TimeoutSec 1 -ErrorAction Stop
        return ($canisHealth.ok -eq $true -and $canisHealth.version -eq '0.1.0')
    } catch {
        return $false
    }
}

if (-not (Test-Path -LiteralPath (Join-Path $canisProjectRoot 'dist/index.html'))) {
    throw 'The exported preview is missing. Keep the complete CatXuan project folder together.'
}

if (-not (Test-CanisPreview)) {
    if ($NoStart) { throw 'CatXuan is not running.' }

    $canisNodeCommand = Get-Command node.exe -ErrorAction SilentlyContinue
    $canisNodePath = if ($canisNodeCommand) { $canisNodeCommand.Source } else { Join-Path $env:ProgramFiles 'nodejs/node.exe' }
    if (-not (Test-Path -LiteralPath $canisNodePath)) { throw 'Node.js is required to open this local preview.' }

    $canisRuntimeDirectory = Join-Path $canisProjectRoot '.catxuan-runtime'
    New-Item -ItemType Directory -Path $canisRuntimeDirectory -Force | Out-Null
    $canisPreviousPort = $env:CAT_ATLAS_PORT
    try {
        $env:CAT_ATLAS_PORT = [string]$Port
        $canisProcess = Start-Process -FilePath $canisNodePath -ArgumentList 'preview-server.mjs' -WorkingDirectory $canisProjectRoot -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $canisRuntimeDirectory ('preview-' + $Port + '.log')) -RedirectStandardError (Join-Path $canisRuntimeDirectory ('preview-' + $Port + '-error.log'))
    } finally {
        $env:CAT_ATLAS_PORT = $canisPreviousPort
    }

    $canisTimer = [System.Diagnostics.Stopwatch]::StartNew()
    $canisReady = $false
    while ($canisTimer.Elapsed.TotalSeconds -lt $StartupTimeoutSeconds) {
        if (Test-CanisPreview) { $canisReady = $true; break }
        if ($canisProcess.HasExited) { break }
        Start-Sleep -Milliseconds 200
    }
    if (-not $canisReady) {
        throw ('CatXuan did not start. Check port ' + $Port + ' and .catxuan-runtime/preview-' + $Port + '-error.log.')
    }
}

if (-not $NoBrowser) { Start-Process -FilePath $canisPreviewUrl }
Write-Output ('CatXuan ready: ' + $canisPreviewUrl)
