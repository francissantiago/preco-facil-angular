Write-Host "Iniciando build de Release..." -ForegroundColor Cyan

# Check if keystore properties exists
if (-not (Test-Path "android/keystore.properties")) {
    Write-Host "Aviso: android/keystore.properties não encontrado." -ForegroundColor Yellow
    Write-Host "O build será gerado sem assinatura (unsigned)." -ForegroundColor Yellow
    Write-Host "Execute setup-keystore.ps1 primeiro para configurar sua chave 'precofacil.keystore'." -ForegroundColor Yellow
    Start-Sleep -Seconds 2
}

# Run build
Set-Location android
.\gradlew.bat bundleRelease
$exitCode = $LASTEXITCODE
Set-Location ..

if ($exitCode -eq 0) {
    Write-Host "`nBuild Concluído com Sucesso!" -ForegroundColor Green
    Write-Host "Arquivo gerado em: android/app/build/outputs/bundle/release/app-release.aab" -ForegroundColor Green
} else {
    Write-Host "`nFalha no Build." -ForegroundColor Red
}

Read-Host "Pressione Enter para sair..."
