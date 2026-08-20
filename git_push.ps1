$gitExe = 'C:\Program Files\Microsoft SQL Server Management Studio 22\Release\Common7\IDE\CommonExtensions\Microsoft\TeamFoundation\Team Explorer\Git\cmd\git.exe'
Set-Alias -Name mygit -Value $gitExe

Write-Host "Staging all files..."
mygit add .

Write-Host "Committing..."
mygit commit -m "Complete MedCare Plus Hospital Appointment System - Practical Exam Set A" 2>$null
mygit branch -M main

Write-Host "Pushing to GitHub repo with --force..."
mygit push -u origin main --force

Write-Host "Your Commit SHA:"
mygit rev-parse HEAD
