# WAVE E.1 - re-frames the existing NexuLex mark for store icons (no redraw, same artwork).
#   icon.png          1024 opaque, mark ~60% of the canvas (was ~44%), solid brand navy, no alpha channel
#   adaptive-icon.png 1024 transparent, mark inside the Android safe zone (66% circle)
#   adaptive-mono.png 1024 transparent white silhouette for Android 13 themed icons
# Source: assets/splash-icon.png (transparent mark). Run: powershell -File scripts/gen-brand-assets.ps1
Add-Type -AssemblyName System.Drawing
$root = Split-Path -Parent $PSScriptRoot
$src = [System.Drawing.Bitmap]::FromFile((Join-Path $root 'assets\splash-icon.png'))
$navy = [System.Drawing.ColorTranslator]::FromHtml('#02091D')

function New-Canvas($bg) {
  $bmp = New-Object System.Drawing.Bitmap 1024, 1024, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = 'HighQuality'; $g.InterpolationMode = 'HighQualityBicubic'; $g.PixelOffsetMode = 'HighQuality'
  if ($bg) { $g.Clear($bg) } else { $g.Clear([System.Drawing.Color]::Transparent) }
  return @($bmp, $g)
}

# Tight bounding box of the mark so scaling is exact, not dependent on the source padding.
$minX = 1024; $minY = 1024; $maxX = 0; $maxY = 0
for ($x = 0; $x -lt $src.Width; $x += 4) {
  for ($y = 0; $y -lt $src.Height; $y += 4) {
    if ($src.GetPixel($x, $y).A -gt 24) {
      if ($x -lt $minX) { $minX = $x }; if ($x -gt $maxX) { $maxX = $x }
      if ($y -lt $minY) { $minY = $y }; if ($y -gt $maxY) { $maxY = $y }
    }
  }
}
# Pad by the scan step so the sparse scan can never shave an extremum off a rounded edge.
$minX = [Math]::Max(0, $minX - 6); $minY = [Math]::Max(0, $minY - 6); $maxX = [Math]::Min(1023, $maxX + 6); $maxY = [Math]::Min(1023, $maxY + 6)
$bw = $maxX - $minX + 1; $bh = $maxY - $minY + 1
"mark bbox: ${bw}x${bh} at ($minX,$minY)"

function Draw-Mark($g, [double]$heightFraction) {
  $th = 1024 * $heightFraction
  $scale = $th / $bh
  $tw = $bw * $scale
  $dest = New-Object System.Drawing.RectangleF ((1024 - $tw) / 2), ((1024 - $th) / 2), $tw, $th
  $srcRect = New-Object System.Drawing.RectangleF $minX, $minY, $bw, $bh
  $g.DrawImage($src, $dest, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
}

# 1) iOS / store icon: opaque, 24-bit RGB.
$pair = New-Canvas $navy; $bmp = $pair[0]; $g = $pair[1]
Draw-Mark $g 0.58
$g.Dispose()
$rgb = New-Object System.Drawing.Bitmap 1024, 1024, ([System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
$g2 = [System.Drawing.Graphics]::FromImage($rgb); $g2.DrawImage($bmp, 0, 0, 1024, 1024); $g2.Dispose()
$rgb.Save((Join-Path $root 'assets\icon.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose(); $rgb.Dispose()

# 2) Android adaptive foreground: transparent, mark height 46% keeps the shield inside the 66% safe circle.
$pair = New-Canvas $null; $bmp = $pair[0]; $g = $pair[1]
Draw-Mark $g 0.46
$g.Dispose()
$bmp.Save((Join-Path $root 'assets\adaptive-icon.png'), [System.Drawing.Imaging.ImageFormat]::Png)

# 3) Android 13 themed icon: single-colour silhouette from the same alpha.
$mono = New-Object System.Drawing.Bitmap 1024, 1024, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$gm = [System.Drawing.Graphics]::FromImage($mono)
$cm = New-Object System.Drawing.Imaging.ColorMatrix
$cm.Matrix00 = 0; $cm.Matrix11 = 0; $cm.Matrix22 = 0; $cm.Matrix33 = 1
$cm.Matrix40 = 1; $cm.Matrix41 = 1; $cm.Matrix42 = 1
$ia = New-Object System.Drawing.Imaging.ImageAttributes
$ia.SetColorMatrix($cm)
$gm.DrawImage($bmp, (New-Object System.Drawing.Rectangle 0, 0, 1024, 1024), 0, 0, 1024, 1024, [System.Drawing.GraphicsUnit]::Pixel, $ia)
$gm.Dispose()
$mono.Save((Join-Path $root 'assets\adaptive-mono.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose(); $mono.Dispose()

# 4) In-app brand mark: tight 256px transparent crop (header and welcome screen), mark fills 100% of the height.
$bm = New-Object System.Drawing.Bitmap 256, 256, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$gb = [System.Drawing.Graphics]::FromImage($bm)
$gb.SmoothingMode = 'HighQuality'; $gb.InterpolationMode = 'HighQualityBicubic'; $gb.PixelOffsetMode = 'HighQuality'
$gb.Clear([System.Drawing.Color]::Transparent)
$ratio = $bw / $bh; $dh = 240.0; $dw = $dh * $ratio
$gb.DrawImage($src, (New-Object System.Drawing.RectangleF ((256 - $dw) / 2), 8, $dw, $dh), (New-Object System.Drawing.RectangleF $minX, $minY, $bw, $bh), [System.Drawing.GraphicsUnit]::Pixel)
$gb.Dispose()
$bm.Save((Join-Path $root 'assets\brand-mark.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$bm.Dispose()
$src.Dispose()
'done'



