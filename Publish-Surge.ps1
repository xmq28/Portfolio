$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$sourceRoot = Join-Path $projectRoot 'wwwroot'
$publishRoot = Join-Path $projectRoot 'surge-dist'
$assetVersion = Get-Date -Format 'yyyyMMddHHmmss'

if (-not (Test-Path $publishRoot)) {
    New-Item -ItemType Directory -Path $publishRoot | Out-Null
}

$portfolioIndex = Join-Path $publishRoot 'index.html'
if (Test-Path $portfolioIndex) {
    $indexHtml = [System.IO.File]::ReadAllText($portfolioIndex)
    $indexHtml = $indexHtml -replace '<script src="/js/site\.js(?:\?[^" ]*)?"></script>', "<script src=`"/js/site.js?v=$assetVersion`"></script>"
    [System.IO.File]::WriteAllText($portfolioIndex, $indexHtml, [System.Text.UTF8Encoding]::new($false))
}

foreach ($directory in @('css', 'js', 'lib', 'resume', 'demos')) {
    $source = Join-Path $sourceRoot $directory
    if (Test-Path $source) {
        Copy-Item -Path $source -Destination $publishRoot -Recurse -Force
    }
}

foreach ($file in @('favicon.ico', 'favicon-32.png', 'favicon-192.png', 'apple-touch-icon.png')) {
    $source = Join-Path $sourceRoot $file
    if (Test-Path $source) {
        Copy-Item -Path $source -Destination (Join-Path $publishRoot $file) -Force
    }
}

$stationDataHubIndex = Join-Path $publishRoot 'demos\stationdatahub\index.html'
foreach ($route in @(
    'dashboard',
    'stations',
    'stations\BAH',
    'stations\JED',
    'stations\RUH',
    'stations\KWI',
    'directory',
    'coverage',
    'admin',
    'admin\users',
    'manager\permissions'
)) {
    $routeDirectory = Join-Path $publishRoot "demos\stationdatahub\$route"
    New-Item -ItemType Directory -Path $routeDirectory -Force | Out-Null
    Copy-Item -Path $stationDataHubIndex -Destination (Join-Path $routeDirectory 'index.html') -Force
}

Write-Output "Synchronized static assets from $sourceRoot to $publishRoot"