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

# 1) Create session via selection
Try-Invoke 'guide:POST selection' {
  $sid = "smoke-" + (Get-Random)
  $script:SID = $sid
  $body = @{ sessionId = $sid; nextStepId = 'unlock_email' } | ConvertTo-Json -Compress
  $r = Invoke-WebRequest -Uri "$Base/api/chat/guide" -Method POST -ContentType 'application/json' -Body $body -TimeoutSec 15
  $json = $r.Content | ConvertFrom-Json
  $ok = ($r.StatusCode -eq 200)
  Write-StepResult 'guide:POST selection' $ok ("StatusCode={0}; sessionId={1}" -f $r.StatusCode, $sid)
}

# 2) Starter pack missing fields -> 400
Try-Invoke 'starter-pack:POST missing fields (expect 400)' {
  $body = @{ sessionId = $script:SID; name = ''; email = '' } | ConvertTo-Json -Compress
  try {
    $r = Invoke-WebRequest -Uri "$Base/api/chat/starter-pack" -Method POST -ContentType 'application/json' -Body $body -TimeoutSec 15 -ErrorAction Stop
    $ok = $r.StatusCode -eq 400
    Write-StepResult 'starter-pack:POST missing fields (expect 400)' $ok ("StatusCode={0}" -f $r.StatusCode)
  } catch {
    $resp = $_.Exception.Response
    if ($resp -ne $null) {
      $status = [int]$resp.StatusCode
      $ok = $status -eq 400
      Write-StepResult 'starter-pack:POST missing fields (expect 400)' $ok ("StatusCode={0}" -f $status)
    } else {
      Write-StepResult 'starter-pack:POST missing fields (expect 400)' $false ("Error: " + $_.Exception.Message)
    }
  }
}

# 3) Starter pack valid -> 200
Try-Invoke 'starter-pack:POST valid' {
  $body = @{ sessionId = $script:SID; name = 'Smoke'; email = 'smoke@example.com'; phone = '000' } | ConvertTo-Json -Compress
  $r = Invoke-WebRequest -Uri "$Base/api/chat/starter-pack" -Method POST -ContentType 'application/json' -Body $body -TimeoutSec 15
  $json = $r.Content | ConvertFrom-Json
  $ok = ($r.StatusCode -eq 200) -and ($json.message -match 'successfully')
  Write-StepResult 'starter-pack:POST valid' $ok ("StatusCode={0}; message={1}" -f $r.StatusCode, $json.message)
}

Write-Host "`nSummary:" -ForegroundColor Cyan
$results | Format-Table -AutoSize

if ($script:failed) { exit 1 } else { exit 0 }
