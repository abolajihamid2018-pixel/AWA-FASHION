# ATLAS environment inspection for Windows. READ-ONLY: installs and changes nothing.
# Run in PowerShell from any folder:
#   powershell -ExecutionPolicy Bypass -File .\inspect_windows.ps1
# Then copy the whole output back into the chat.

$ErrorActionPreference = "SilentlyContinue"
Write-Output "ATLAS Windows environment report (read-only)"
Write-Output "============================================="

$os = Get-CimInstance Win32_OperatingSystem
$cs = Get-CimInstance Win32_ComputerSystem
$cpu = Get-CimInstance Win32_Processor | Select-Object -First 1
Write-Output ("OS            : {0} {1} build {2} ({3})" -f $os.Caption, $os.Version, $os.BuildNumber, $os.OSArchitecture)
Write-Output ("CPU           : {0} ({1} logical cores)" -f $cpu.Name.Trim(), $cs.NumberOfLogicalProcessors)
Write-Output ("RAM total     : {0:N0} MB" -f ($cs.TotalPhysicalMemory / 1MB))
Write-Output ("RAM free now  : {0:N0} MB" -f ($os.FreePhysicalMemory / 1KB))
Get-PSDrive -PSProvider FileSystem | Where-Object { $_.Used -ne $null } | ForEach-Object {
    Write-Output ("Disk {0}:       {1:N1} GB free of {2:N1} GB" -f $_.Name, ($_.Free / 1GB), (($_.Used + $_.Free) / 1GB))
}
$disk = Get-PhysicalDisk | Select-Object -First 1
if ($disk) { Write-Output ("Disk type     : {0}" -f $disk.MediaType) }

Write-Output ""
Write-Output "Python interpreters:"
$found = $false
if (Get-Command py -ErrorAction SilentlyContinue) { py -0p 2>$null | ForEach-Object { Write-Output "  py launcher: $_" }; $found = $true }
foreach ($cmd in @("python", "python3")) {
    $c = Get-Command $cmd -ErrorAction SilentlyContinue
    if ($c -and $c.Source -notlike "*WindowsApps*") {
        $v = & $c.Source -c "import sys,struct;print(sys.version.split()[0], str(struct.calcsize('P')*8)+'-bit')" 2>$null
        Write-Output ("  {0}: {1} ({2})" -f $cmd, $v, $c.Source); $found = $true
    } elseif ($c) { Write-Output "  ${cmd}: Microsoft Store alias only (not a real install)" }
}
if (-not $found) { Write-Output "  none found" }

Write-Output ""
Write-Output "MetaTrader 5:"
$mt5 = @()
foreach ($base in @($env:ProgramFiles, ${env:ProgramFiles(x86)})) {
    if ($base) { $mt5 += Get-ChildItem -Path $base -Filter terminal64.exe -Recurse -Depth 2 -ErrorAction SilentlyContinue }
}
if ($mt5.Count -gt 0) { $mt5 | ForEach-Object { Write-Output "  terminal: $($_.FullName)" } } else { Write-Output "  terminal64.exe not found" }
$data = Join-Path $env:APPDATA "MetaQuotes\Terminal"
if (Test-Path $data) { Write-Output "  data folder: $data" }
if (Get-Process terminal64 -ErrorAction SilentlyContinue) { Write-Output "  terminal is RUNNING" }

Write-Output ""
Write-Output "Other tools:"
foreach ($t in @("git")) {
    $c = Get-Command $t -ErrorAction SilentlyContinue
    if ($c) { Write-Output ("  {0}: {1}" -f $t, (& $t --version)) } else { Write-Output "  ${t}: not found" }
}
Write-Output ""
Write-Output "Done. Nothing was installed or changed."
