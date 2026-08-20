$gitExe = 'C:\Program Files\Microsoft SQL Server Management Studio 22\Release\Common7\IDE\CommonExtensions\Microsoft\TeamFoundation\Team Explorer\Git\cmd\git.exe'
Set-Alias -Name mygit -Value $gitExe

Write-Host "Initializing Git Repository..."
mygit init
mygit config user.name "pateljapesh"
mygit config user.email "pateljapesh@users.noreply.github.com"

Write-Host "Staging files..."
mygit add .

Write-Host "Creating commit..."
mygit commit -m "Complete MedCare Plus Hospital Appointment System - Practical Exam Set A"
mygit branch -M main

Write-Host "Configuring remote..."
mygit remote remove origin 2>$null
mygit remote add origin https://github.com/pateljapesh/itue301-exam-D25DCE157-batch_c.git

Write-Host "Commit details:"
mygit log -1 --stat
mygit rev-parse HEAD

Write-Host "Pushing to GitHub..."
mygit push -u origin main
