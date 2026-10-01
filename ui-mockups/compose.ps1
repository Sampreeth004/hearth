# Combines every desktop + mobile screenshot into a single labeled mockup sheet.
# Usage:  powershell -ExecutionPolicy Bypass -File .\compose.ps1
$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$desktopFiles = Get-ChildItem (Join-Path $root "desktop\*.png") | Sort-Object Name
$mobileFiles = Get-ChildItem (Join-Path $root "mobile\*.png") | Sort-Object Name
$outPath = Join-Path $root "hearth-ui-mockups.png"

$W = 2000
$margin = 50
$contentW = $W - 2 * $margin

# Desktop grid
$colsD = 4; $gapD = 24
$tileWD = [math]::Floor(($contentW - ($colsD - 1) * $gapD) / $colsD)
$tileHD = [math]::Round($tileWD * 1800.0 / 2880.0)
$rowsD = [math]::Ceiling($desktopFiles.Count / $colsD)

# Mobile grid
$colsM = 6; $gapM = 20
$tileWM = [math]::Floor(($contentW - ($colsM - 1) * $gapM) / $colsM)
$tileHM = [math]::Round($tileWM * 1688.0 / 780.0)
$rowsM = [math]::Ceiling($mobileFiles.Count / $colsM)

$captionH = 28
$cellHD = $tileHD + $captionH
$cellHM = $tileHM + $captionH
$headerH = 130
$sectionTitleH = 56
$sectionGap = 60

$desktopBlockH = $rowsD * $cellHD + ($rowsD - 1) * $gapD
$mobileBlockH = $rowsM * $cellHM + ($rowsM - 1) * $gapM
$H = $margin + $headerH + $sectionTitleH + $desktopBlockH + $sectionGap + $sectionTitleH + $mobileBlockH + $margin

$bmp = New-Object System.Drawing.Bitmap($W, $H)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

$g.Clear([System.Drawing.Color]::FromArgb(250, 250, 249))

$fontTitle = New-Object System.Drawing.Font("Segoe UI", 34, [System.Drawing.FontStyle]::Bold)
$fontSub = New-Object System.Drawing.Font("Segoe UI", 18)
$fontSection = New-Object System.Drawing.Font("Segoe UI", 20, [System.Drawing.FontStyle]::Bold)
$fontCaption = New-Object System.Drawing.Font("Segoe UI", 12)
$brushTitle = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(28, 25, 23))
$brushSub = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(120, 113, 108))
$brushCaption = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(87, 83, 78))
$brushAccent = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(249, 115, 22))
$shadowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(22, 0, 0, 0))
$borderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(231, 229, 228), 1)

function Draw-Section {
  param($Title, $Files, $Cols, $Gap, $TileW, $TileH, $CellH, $Rows, $YStart)
  $g.FillRectangle($brushAccent, $margin, ($YStart + 5), 6, 26)
  $g.DrawString($Title, $fontSection, $brushTitle, ($margin + 16), $YStart)
  $gridY = $YStart + $sectionTitleH
  for ($i = 0; $i -lt $Files.Count; $i++) {
    $col = $i % $Cols
    $row = [math]::Floor($i / $Cols)
    $x = $margin + $col * ($TileW + $Gap)
    $ty = $gridY + $row * ($CellH + $Gap)
    $img = [System.Drawing.Image]::FromFile($Files[$i].FullName)
    $g.FillRectangle($shadowBrush, ($x + 3), ($ty + 3), $TileW, $TileH)
    $g.DrawImage($img, $x, $ty, $TileW, $TileH)
    $g.DrawRectangle($borderPen, $x, $ty, $TileW, $TileH)
    $label = [System.IO.Path]::GetFileNameWithoutExtension($Files[$i].Name)
    $g.DrawString($label, $fontCaption, $brushCaption, $x, ($ty + $TileH + 4))
    $img.Dispose()
  }
  return $gridY + $Rows * $CellH + ($Rows - 1) * $Gap
}

$y = $margin
$g.DrawString("Hearth - UI Mockups", $fontTitle, $brushTitle, $margin, $y)
$g.DrawString("Real-time chat app built with Next.js, Firebase & Tailwind CSS  |  Light theme", $fontSub, $brushSub, $margin, ($y + 54))
$y += $headerH

$y = Draw-Section "Desktop - 1440 x 900" $desktopFiles $colsD $gapD $tileWD $tileHD $cellHD $rowsD $y
$y += $sectionGap
$y = Draw-Section "Mobile - 390 x 844" $mobileFiles $colsM $gapM $tileWM $tileHM $cellHM $rowsM $y

$g.Dispose()
$bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()

Write-Host ("Saved {0} ({1}x{2}, {3} KB)" -f $outPath, $W, $H, [math]::Round((Get-Item $outPath).Length / 1KB))
