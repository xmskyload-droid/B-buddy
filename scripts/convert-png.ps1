Add-Type -AssemblyName System.Drawing

$dir = "C:\Users\APARNA\Desktop\New folder (2)\flow-finance\assets\images\"
$files = @("icon.png", "android-icon-foreground.png", "splash-icon.png")

foreach ($f in $files) {
    $filePath = Join-Path $dir $f
    $img = [System.Drawing.Image]::FromFile($filePath)
    $tmpPath = $filePath + ".tmp.png"
    $img.Save($tmpPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $img.Dispose()
    Move-Item $tmpPath $filePath -Force
    Write-Host "Converted $f to true PNG format."
}
