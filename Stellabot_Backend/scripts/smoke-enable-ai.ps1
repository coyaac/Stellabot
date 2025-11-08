param(
  [string]$Base = "https://stellabot-backend.vercel.app"
)

$ErrorActionPreference = 'Stop'
$script:failed = $false
$results = @()

function Write-StepResult($name, $ok, $detail) {
  $status = if ($ok) { 'PASS' } else { 'FAIL' }
  if (-not $ok) { $script:failed = $true }
  $results += [pscustomobject]@{ step=$name; status=$status; detail=$detail }
  $color = if ($ok) { 'Green' } else { 'Red' }
  Write-Host ("[{0}] {1} - {2}" -f $status, $name, $detail) -ForegroundColor $color
}

function Try-Invoke($name, [scriptblock]$action) {
  try { & $action } catch { Write-StepResult $name $false ("Error: " + $_.Exception.Message) }
}

# 1) Create session via first POST selection (counts as guided)
Try-Invoke 'guide:POST selection' {
  $sid = "smoke-" + (Get-Random)
  $script:SID = $sid
  $body = @{ sessionId = $sid; nextStepId = 'entrepreneur_intro' } | ConvertTo-Json -Compress
  $r = Invoke-WebRequest -Uri "$Base/api/chat/guide" -Method POST -ContentType 'application/json' -Body $body -TimeoutSec 15
  $json = $null
  try { $json = $r.Content | ConvertFrom-Json } catch {}
  $ok = ($r.StatusCode -eq 200) -and ($json.guidedCount -ge 1)
  Write-StepResult 'guide:POST selection' $ok ("StatusCode={0}; guidedCount={1}; sessionId={2}" -f $r.StatusCode, $json.guidedCount, $sid)
}

# 2) Enable AI
Try-Invoke 'POST /api/chat/enable-ai' {
  $body = @{ sessionId = $script:SID; name = 'Smoke'; email = 'smoke@example.com' } | ConvertTo-Json -Compress
  $r = Invoke-WebRequest -Uri "$Base/api/chat/enable-ai" -Method POST -ContentType 'application/json' -Body $body -TimeoutSec 15
  $json = $null
  try { $json = $r.Content | ConvertFrom-Json } catch {}
  $ok = ($r.StatusCode -eq 200) -and ($json.message -match 'AI has been activated')
  Write-StepResult 'POST /api/chat/enable-ai' $ok ("StatusCode={0}; message={1}" -f $r.StatusCode, $json.message)
}

Write-Host "`nSummary:" -ForegroundColor Cyan
$results | Format-Table -AutoSize

if ($script:failed) { exit 1 } else { exit 0 }
