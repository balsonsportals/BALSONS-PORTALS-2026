# ==============================================================================
# BALSONS ENTERPRISE ECOSYSTEM (2026) - CLASP AUTOMATED DEPLOYMENT ORCHESTRATOR
# Target Google Account: balsonsportals@gmail.com
# ==============================================================================

Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "   BALSONS MULTI-PORTAL ENTERPRISE ECOSYSTEM (2026)              " -ForegroundColor Cyan
Write-Host "   Google Apps Script Clasp Provisioning & Push Orchestrator    " -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan

# 1. Check Clasp Authorization State
$authOutput = & "C:\Users\Lenovo\AppData\Roaming\npm\clasp.cmd" show-authorized-user 2>&1 | Out-String
Write-Host "`nCurrent Clasp Authorization Status:" -ForegroundColor Yellow
Write-Host $authOutput

if ($authOutput -notmatch "balsonsportals@gmail.com") {
    Write-Host "[ACTION REQUIRED] You are not currently authenticated as balsonsportals@gmail.com." -ForegroundColor Red
    Write-Host "Please run the following command in your terminal first to log in:" -ForegroundColor Yellow
    Write-Host "  clasp login`n" -ForegroundColor Green
    Write-Host "Then press Enter in your browser to authorize balsonsportals@gmail.com." -ForegroundColor Yellow
    exit 1
}

Write-Host "[SUCCESS] Authenticated as balsonsportals@gmail.com. Proceeding with deployment...`n" -ForegroundColor Green

$projects = @(
    @{ Name = "BALSONS_DATABASE_PROVISIONER"; Path = "database-provisioning"; Type = "standalone" },
    @{ Name = "BALSONS_HR_PAYROLL_ENGINE"; Path = "BALSONS HR MANAGER\apps-script"; Type = "standalone" },
    @{ Name = "BALSONS_GATE_ENTRY_ENGINE"; Path = "BALSONS GATE ENTRY MANAGER\apps-script"; Type = "standalone" },
    @{ Name = "BALSONS_SAFETY_PTW_ENGINE"; Path = "BALSONS SAFETY MANAGER\apps-script"; Type = "standalone" },
    @{ Name = "BALSONS_STORE_RIGGING_ENGINE"; Path = "BALSONS STORE MANAGER\apps-script"; Type = "standalone" },
    @{ Name = "BALSONS_PURCHASE_COMMERCIAL_ENGINE"; Path = "BALSONS PURCHASE MANAGER\apps-script"; Type = "standalone" },
    @{ Name = "BALSONS_OPERATIONS_ERECTION_ENGINE"; Path = "BALSONS OPERATIONS MANAGER\apps-script"; Type = "standalone" }
)

$deploymentSummary = @()

foreach ($proj in $projects) {
    Write-Host "------------------------------------------------------------------" -ForegroundColor Cyan
    Write-Host "Deploying Backend: $($proj.Name)" -ForegroundColor Yellow
    Write-Host "Path: $($proj.Path)" -ForegroundColor Gray
    
    $fullPath = Join-Path $PSScriptRoot $proj.Path
    Push-Location $fullPath

    try {
        # Check if .clasp.json exists
        if (!(Test-Path ".clasp.json")) {
            Write-Host "Creating new Apps Script project: $($proj.Name)..." -ForegroundColor Gray
            & "C:\Users\Lenovo\AppData\Roaming\npm\clasp.cmd" create --title $proj.Name --type $proj.Type
        } else {
            Write-Host ".clasp.json found. Using existing script configuration." -ForegroundColor Gray
        }

        # Push code
        Write-Host "Pushing files to script.google.com..." -ForegroundColor Gray
        & "C:\Users\Lenovo\AppData\Roaming\npm\clasp.cmd" push -f

        # Deploy as Web App
        Write-Host "Creating production Web App deployment..." -ForegroundColor Gray
        $deployResult = & "C:\Users\Lenovo\AppData\Roaming\npm\clasp.cmd" deploy --description "Production Release v1.0.0" 2>&1 | Out-String
        Write-Host $deployResult -ForegroundColor Green

        $scriptId = ""
        if (Test-Path ".clasp.json") {
            $claspJson = Get-Content ".clasp.json" -Raw | ConvertFrom-Json
            $scriptId = $claspJson.scriptId
        }

        $deploymentSummary += [PSCustomObject]@{
            Project = $proj.Name
            Path = $proj.Path
            ScriptId = $scriptId
            Status = "DEPLOYED"
        }

    } catch {
        Write-Host "Error deploying $($proj.Name): $_" -ForegroundColor Red
        $deploymentSummary += [PSCustomObject]@{
            Project = $proj.Name
            Path = $proj.Path
            ScriptId = "ERROR"
            Status = "FAILED"
        }
    } finally {
        Pop-Location
    }
}

Write-Host "`n==================================================================" -ForegroundColor Cyan
Write-Host "   DEPLOYMENT SUMMARY                                             " -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan
$deploymentSummary | Format-Table -AutoSize
