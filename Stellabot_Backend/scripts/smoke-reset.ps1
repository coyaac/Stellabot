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

# 1) Create session and increment guidedCount
Try-Invoke 'guide:POST selection' {
  $sid = "smoke-" + (Get-Random)
  $script:SID = $sid
  $body = @{ sessionId = $sid; nextStepId = 'entrepreneur_intro' } | ConvertTo-Json -Compress
  $r = Invoke-WebRequest -Uri "$Base/api/chat/guide" -Method POST -ContentType 'application/json' -Body $body -TimeoutSec 15
  $json = $r.Content | ConvertFrom-Json
  $ok = ($r.StatusCode -eq 200) -and ($json.guidedCount -ge 1)
  Write-StepResult 'guide:POST selection' $ok ("StatusCode={0}; guidedCount={1}" -f $r.StatusCode, $json.guidedCount)
}

# 2) Reset session
Try-Invoke 'POST /api/chat/reset' {
  $body = @{ sessionId = $script:SID } | ConvertTo-Json -Compress
  $r = Invoke-WebRequest -Uri "$Base/api/chat/reset" -Method POST -ContentType 'application/json' -Body $body -TimeoutSec 15
  $json = $r.Content | ConvertFrom-Json
  $ok = ($r.StatusCode -eq 200) -and ($json.ok -eq $true)
  Write-StepResult 'POST /api/chat/reset' $ok ("StatusCode={0}; ok={1}" -f $r.StatusCode, $json.ok)
}

# 3) After reset, IA should be forbidden again
Try-Invoke 'ia:POST after reset (expect 403)' {
  $body = @{ sessionId = $script:SID; message = 'hello' } | ConvertTo-Json -Compress
  try {
    $r = Invoke-WebRequest -Uri "$Base/api/chat/ia" -Method POST -ContentType 'application/json' -Body $body -TimeoutSec 15 -ErrorAction Stop
    $ok = $r.StatusCode -eq 403
    Write-StepResult 'ia:POST after reset (expect 403)' $ok ("StatusCode={0}" -f $r.StatusCode)
  } catch {
    $resp = $_.Exception.Response
    if ($resp -ne $null) {
      $status = [int]$resp.StatusCode
      $ok = $status -eq 403
      Write-StepResult 'ia:POST after reset (expect 403)' $ok ("StatusCode={0}" -f $status)
    } else {
      Write-StepResult 'ia:POST after reset (expect 403)' $false ("Error: " + $_.Exception.Message)
    }
  }
}

Write-Host "`nSummary:" -ForegroundColor Cyan
$results | Format-Table -AutoSize

if ($script:failed) { exit 1 } else { exit 0 }
