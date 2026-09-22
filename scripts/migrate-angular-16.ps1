$ErrorActionPreference = 'Stop'

Write-Host "Z-Store Angular 16 migration helper" -ForegroundColor Cyan

$node = node --version
Write-Host "Node: $node"

if (-not (Test-Path '.git')) {
    throw "Run this script from the project root inside a Git repository."
}

$status = git status --porcelain
if ($status) {
    throw "Working tree is not clean. Commit or stash changes before starting the migration."
}

Write-Host "Creating a safety tag..." -ForegroundColor Yellow
git tag -f "z-store-before-angular-16"

Write-Host "Updating Angular core and CLI to the latest Angular 16 patch..." -ForegroundColor Yellow
npx ng update "@angular/core@^16" "@angular/cli@^16"

if ($LASTEXITCODE -ne 0) {
    throw "Angular core/CLI update failed. No further package updates were attempted."
}

if (Test-Path 'node_modules/@angular/cdk') {
    Write-Host "Updating Angular CDK to Angular 16..." -ForegroundColor Yellow
    npx ng update "@angular/cdk@^16"
    if ($LASTEXITCODE -ne 0) {
        throw "Angular CDK update failed."
    }
}

Write-Host "Running a production build..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    throw "Production build failed after migration."
}

Write-Host "Angular 16 migration completed successfully." -ForegroundColor Green
