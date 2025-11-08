param(
  [string]$Base = "https://stellabot-backend.vercel.app",
  [switch]$SkipAiCall
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
  $body = @{ sessionId = $sid; nextStepId = 'rto_intro' } | ConvertTo-Json -Compress
  $r = Invoke-WebRequest -Uri "$Base/api/chat/guide" -Method POST -ContentType 'application/json' -Body $body -TimeoutSec 15
  $json = $r.Content | ConvertFrom-Json
  $ok = ($r.StatusCode -eq 200) -and ($json.guidedCount -ge 1)
  Write-StepResult 'guide:POST selection' $ok ("StatusCode={0}; guidedCount={1}" -f $r.StatusCode, $json.guidedCount)
}

# 2) Call IA before enabling (expect 403)
Try-Invoke 'ia:POST before enable (expect 403)' {
  $body = @{ sessionId = $script:SID; message = 'Hello' } | ConvertTo-Json -Compress
  $r = $null
  try {
    $r = Invoke-WebRequest -Uri "$Base/api/chat/ia" -Method POST -ContentType 'application/json' -Body $body -TimeoutSec 20 -ErrorAction Stop
    # If we don't get an error, still check status code
    $ok = $r.StatusCode -eq 403
    Write-StepResult 'ia:POST before enable (expect 403)' $ok ("StatusCode={0}" -f $r.StatusCode)
  } catch {
    # PowerShell throws for non-2xx; extract Response
    $resp = $_.Exception.Response
    if ($resp -ne $null) {
      $status = [int]$resp.StatusCode
      $ok = $status -eq 403
      Write-StepResult 'ia:POST before enable (expect 403)' $ok ("StatusCode={0}" -f $status)
    } else {
      Write-StepResult 'ia:POST before enable (expect 403)' $false ("Error: " + $_.Exception.Message)
    }
  }
}

# 3) Enable AI
Try-Invoke 'POST /api/chat/enable-ai' {
  $body = @{ sessionId = $script:SID; name = 'Smoke'; email = 'smoke@example.com' } | ConvertTo-Json -Compress
  $r = Invoke-WebRequest -Uri "$Base/api/chat/enable-ai" -Method POST -ContentType 'application/json' -Body $body -TimeoutSec 15
  $json = $r.Content | ConvertFrom-Json
  $ok = ($r.StatusCode -eq 200) -and ($json.message -match 'activated')
  Write-StepResult 'POST /api/chat/enable-ai' $ok ("StatusCode={0}; message={1}" -f $r.StatusCode, $json.message)
}

# 4) IA call after enabling (200 with reply) unless SkipAiCall
Try-Invoke 'ia:POST after enable' {
  if ($SkipAiCall) {
    Write-StepResult 'ia:POST after enable' $true 'Skipped actual AI call (SkipAiCall)'
    return
  }
  $body = @{ sessionId = $script:SID; message = 'Give me one short tip.' } | ConvertTo-Json -Compress
  $r = $null
  try {
    $r = Invoke-WebRequest -Uri "$Base/api/chat/ia" -Method POST -ContentType 'application/json' -Body $body -TimeoutSec 30 -ErrorAction Stop
    $json = $r.Content | ConvertFrom-Json
    $hasReply = $json -ne $null -and [string]::IsNullOrWhiteSpace($json.reply) -eq $false
    $ok = ($r.StatusCode -eq 200) -and $hasReply
    Write-StepResult 'ia:POST after enable' $ok ("StatusCode={0}; reply?={1}" -f $r.StatusCode, $hasReply)
  } catch {
    # If AI key is missing, backend may return 500 with helpful message; treat that as soft-fail info
    $resp = $_.Exception.Response
    if ($resp -ne $null) {
      $status = [int]$resp.StatusCode
      $ok = $false
      Write-StepResult 'ia:POST after enable' $ok ("StatusCode={0}; likely missing GEMINI_API_KEY or SDK" -f $status)
    } else {
      Write-StepResult 'ia:POST after enable' $false ("Error: " + $_.Exception.Message)
    }
  }
}

Write-Host "`nSummary:" -ForegroundColor Cyan
$results | Format-Table -AutoSize

if ($script:failed) { exit 1 } else { exit 0 }
