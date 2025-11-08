param(
  [string]$Base = "https://stellabot-backend.vercel.app",
  [string]$Origin = "https://stellabot-frontend.vercel.app"
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

# 1) Health
Try-Invoke 'health:GET /api/health' {
  $r = Invoke-WebRequest -Uri "$Base/api/health" -Method GET -TimeoutSec 10
  $ok = $r.StatusCode -eq 200
  $json = $null
  try { $json = $r.Content | ConvertFrom-Json } catch {}
  $ok = $ok -and $json -ne $null -and $json.status -eq 'ok'
  Write-StepResult 'health:GET /api/health' $ok ("StatusCode={0}; status={1}" -f $r.StatusCode, ($json.status))
}

# 2) Guide GET start
Try-Invoke 'guide:GET /api/chat/guide' {
  $r = Invoke-WebRequest -Uri "$Base/api/chat/guide" -Method GET -TimeoutSec 10
  $json = $null
  try { $json = $r.Content | ConvertFrom-Json } catch {}
  $hasText = ($json -ne $null -and [string]::IsNullOrWhiteSpace($json.text) -eq $false)
  $hasOptions = ($json -ne $null -and $json.options -ne $null -and $json.options.Count -ge 1)
  $ok = ($r.StatusCode -eq 200) -and $hasText -and $hasOptions
  Write-StepResult 'guide:GET /api/chat/guide' $ok ("StatusCode={0}; text?={1}; options={2}" -f $r.StatusCode, $hasText, ($json.options.Count))
}

# 3) Guide POST start (should not increment guidedCount)
Try-Invoke 'guide:POST /api/chat/guide (start)' {
  $sid = "smoke-" + (Get-Random)
  $body = @{ sessionId = $sid; nextStepId = 'start' } | ConvertTo-Json -Compress
  $r = Invoke-WebRequest -Uri "$Base/api/chat/guide" -Method POST -ContentType 'application/json' -Body $body -TimeoutSec 15
  $json = $null
  try { $json = $r.Content | ConvertFrom-Json } catch {}
  $ok = ($r.StatusCode -eq 200) -and ($json.guidedCount -eq 0)
  Write-StepResult 'guide:POST /api/chat/guide (start)' $ok ("StatusCode={0}; guidedCount={1}" -f $r.StatusCode, $json.guidedCount)
}

# 4) CORS preflight OPTIONS for /api/chat/guide
Try-Invoke 'cors:OPTIONS /api/chat/guide' {
  $headersPre = @{
    'Origin' = $Origin
    'Access-Control-Request-Method' = 'POST'
    'Access-Control-Request-Headers' = 'content-type'
  }
  $r = Invoke-WebRequest -Uri "$Base/api/chat/guide" -Method OPTIONS -Headers $headersPre -TimeoutSec 10
  $statusOk = ($r.StatusCode -eq 204 -or $r.StatusCode -eq 200)
  $allowOrigin = $r.Headers['Access-Control-Allow-Origin']
  $allowMethods = $r.Headers['Access-Control-Allow-Methods']
  $allowHeaders = $r.Headers['Access-Control-Allow-Headers']
  $corsOk = ($allowOrigin -eq $Origin) -and ($allowMethods -match 'POST') -and ($allowHeaders -match 'content-type')
  Write-StepResult 'cors:OPTIONS /api/chat/guide' ($statusOk -and $corsOk) ("StatusCode={0}; ACO={1}; ACM={2}; ACH={3}" -f $r.StatusCode, $allowOrigin, $allowMethods, $allowHeaders)
}

Write-Host "`nSummary:" -ForegroundColor Cyan
$results | Format-Table -AutoSize

if ($script:failed) { exit 1 } else { exit 0 }
