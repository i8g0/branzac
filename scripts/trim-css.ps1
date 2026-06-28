$cssPath = Join-Path $PSScriptRoot "..\src\index.css"
$lines = [System.IO.File]::ReadAllLines($cssPath)
$trimmed = $lines[0..7855]
[System.IO.File]::WriteAllLines($cssPath, $trimmed)
Write-Output ("Done. Lines: " + $trimmed.Count)
