$cssPath = Join-Path $PSScriptRoot "..\src\index.css"
$lines = [System.IO.File]::ReadAllLines($cssPath)

# Find the line ".stitch-add-btn:active {" followed by "  transform: scale(0.96);" and "}"
# Then remove everything from after that closing brace until "/* Stitch Skeleton */"
$newLines = New-Object System.Collections.ArrayList

$skipMode = $false
$foundActive = $false

for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    
    if ($line.Trim() -eq '.stitch-add-btn:active {' -and -not $foundActive) {
        $foundActive = $true
        [void]$newLines.Add($line)
        continue
    }
    
    if ($foundActive -and -not $skipMode -and $line.Trim() -eq '}') {
        [void]$newLines.Add($line)
        $skipMode = $true
        continue
    }
    
    if ($skipMode) {
        if ($line.Contains('/* Stitch Skeleton */')) {
            $skipMode = $false
            [void]$newLines.Add("")
            [void]$newLines.Add($line)
            continue
        }
        # skip this line (it's duplicate old CSS)
        continue
    }
    
    [void]$newLines.Add($line)
}

[System.IO.File]::WriteAllLines($cssPath, $newLines.ToArray())
Write-Output ("Done. Old: " + $lines.Count + " New: " + $newLines.Count)
