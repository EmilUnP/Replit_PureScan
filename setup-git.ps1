# PowerShell script to set up Git and push to GitHub
# Run this script after installing Git

Write-Host "Setting up Git repository for PureScan2..." -ForegroundColor Green

# Check if Git is installed
if (!(Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Git is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Git from: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

# Initialize Git repository if not already initialized
if (!(Test-Path ".git")) {
    Write-Host "Initializing Git repository..." -ForegroundColor Yellow
    git init
}

# Add remote origin (remove existing if it exists)
$remoteExists = git remote get-url origin 2>$null
if ($remoteExists) {
    Write-Host "Removing existing remote origin..." -ForegroundColor Yellow
    git remote remove origin
}

Write-Host "Adding GitHub remote..." -ForegroundColor Yellow
git remote add origin https://github.com/EmilUnP/Replit_PureScan.git

# Add all files
Write-Host "Adding files to Git..." -ForegroundColor Yellow
git add .

# Check if there are any changes to commit
$status = git status --porcelain
if ($status) {
    # Commit changes
    Write-Host "Committing changes..." -ForegroundColor Yellow
    git commit -m "Initial commit: PureScan2 project - Next.js app with Supabase integration"
    
    # Push to GitHub
    Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
    Write-Host "You may be prompted for GitHub authentication..." -ForegroundColor Cyan
    git push -u origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Successfully pushed to GitHub!" -ForegroundColor Green
        Write-Host "Repository URL: https://github.com/EmilUnP/Replit_PureScan" -ForegroundColor Cyan
    } else {
        Write-Host "Push failed. You may need to authenticate with GitHub." -ForegroundColor Red
        Write-Host "Consider using a Personal Access Token or GitHub CLI for authentication." -ForegroundColor Yellow
    }
} else {
    Write-Host "No changes to commit." -ForegroundColor Yellow
}

Write-Host "Setup complete!" -ForegroundColor Green

# Install GitHub CLI
winget install --id GitHub.cli

# Authenticate
gh auth login 