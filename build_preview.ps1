# OUDHIRA Offline Preview Build Script

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$dist = "dist_preview"
if (Test-Path $dist) { 
    Remove-Item -Path $dist -Recurse -Force 
}
New-Item -ItemType Directory -Path $dist
New-Item -ItemType Directory -Path "$dist/public"

$filesToCopy = @(
    "index.html",
    "heritage.html",
    "products.html",
    "experience.html",
    "product-master.html",
    "product-aura.html",
    "styles.css",
    "script.js"
)

foreach ($file in $filesToCopy) {
    if (Test-Path $file) {
        $content = Get-Content -Path $file -Raw -Encoding utf8
        $content | Out-File -FilePath "$dist/$file" -Encoding utf8
    }
}

Copy-Item -Path "public/*" -Destination "$dist/public" -Recurse -Force

if (Test-Path "locales") {
    New-Item -ItemType Directory -Path "$dist/locales" -Force
    $localeFiles = Get-ChildItem -Path "locales/*.json"
    foreach ($lFile in $localeFiles) {
        $lContent = Get-Content -Path $lFile.FullName -Raw -Encoding utf8
        $lContent | Out-File -FilePath "$dist/locales/$($lFile.Name)" -Encoding utf8
    }
}

$readme = "OUDHIRA Offline Preview`n`nHow to use:`n1. Double click index.html to preview.`n2. All assets (images, videos, styles) are included."
$readme | Out-File -FilePath "$dist/README.txt" -Encoding utf8

Write-Host "Done! Please check the dist_preview folder."
