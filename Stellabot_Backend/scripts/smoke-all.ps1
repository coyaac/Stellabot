param(
  [string]$Base = "https://stellabot-backend.vercel.app",
  [string]$Origin = "https://stellabot-frontend.vercel.app",
  [switch]$SkipAiCall
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "Running: smoke-backend.ps1" -ForegroundColor Cyan
& "$root/smoke-backend.ps1" -Base $Base -Origin $Origin
$code1 = $LASTEXITCODE

Write-Host "Running: smoke-enable-ai.ps1" -ForegroundColor Cyan
& "$root/smoke-enable-ai.ps1" -Base $Base
$code2 = $LASTEXITCODE

Write-Host "Running: smoke-starter-pack.ps1" -ForegroundColor Cyan
& "$root/smoke-starter-pack.ps1" -Base $Base
$code3 = $LASTEXITCODE

Write-Host "Running: smoke-ia.ps1" -ForegroundColor Cyan
if ($SkipAiCall) {
  & "$root/smoke-ia.ps1" -Base $Base -SkipAiCall
} else {
  & "$root/smoke-ia.ps1" -Base $Base
}
$code4 = $LASTEXITCODE

Write-Host "Running: smoke-reset.ps1" -ForegroundColor Cyan
& "$root/smoke-reset.ps1" -Base $Base
$code5 = $LASTEXITCODE

$failed = ($code1 -ne 0 -or $code2 -ne 0 -or $code3 -ne 0 -or $code4 -ne 0 -or $code5 -ne 0)
if ($failed) {
  Write-Host "One or more smoke tests FAILED." -ForegroundColor Red
  exit 1
} else {
  Write-Host "All smoke tests PASSED." -ForegroundColor Green
  exit 0
}
