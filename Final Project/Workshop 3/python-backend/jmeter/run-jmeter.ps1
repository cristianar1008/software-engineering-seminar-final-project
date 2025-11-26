param([string]$JMeterCmd = "jmeter")
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$jmx = Join-Path $root "backend_stress_test.jmx"
$resultsDir = Join-Path $root "results"
New-Item -ItemType Directory -Force -Path $resultsDir | Out-Null
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$jtl = Join-Path $resultsDir ("results-" + $timestamp + ".jtl")
$htmlDir = Join-Path $resultsDir ("html-" + $timestamp)
& $JMeterCmd -n -t $jmx -l $jtl -e -o $htmlDir
