$keystoreFile = "precofacil.keystore"

if (-not (Test-Path $keystoreFile)) {
    Write-Host "Arquivo $keystoreFile não encontrado na raiz." -ForegroundColor Red
    Read-Host "Pressione Enter para sair..."
    exit 1
}

$alias = Read-Host -Prompt "Digite o Alias da chave"
$password = Read-Host -Prompt "Digite a senha do Keystore" -AsSecureString
$passwordPlain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))

$keyPassword = Read-Host -Prompt "Digite a senha da chave (deixe em branco se for a mesma)" -AsSecureString

if ($keyPassword.Length -eq 0) {
    $keyPasswordPlain = $passwordPlain
} else {
    $keyPasswordPlain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($keyPassword))
}

# Create android directory if not exists
if (-not (Test-Path "android")) {
    New-Item -ItemType Directory -Path "android" | Out-Null
}

# Create keystore.properties in android/ folder
# Path to keystore is relative to android/app/ (where build.gradle is)
# So if keystore is in root, it is ../../precofacil.keystore
$propertiesContent = @"
storePassword=$passwordPlain
keyPassword=$keyPasswordPlain
keyAlias=$alias
storeFile=../../$keystoreFile
"@

Set-Content -Path "android/keystore.properties" -Value $propertiesContent

Write-Host "`nConfiguração salva com sucesso!" -ForegroundColor Green
Write-Host "Arquivo criado: android/keystore.properties" -ForegroundColor Green
Write-Host "`nAgora execute o script de build:" -ForegroundColor Cyan
Write-Host ".\release-build.ps1" -ForegroundColor White

Read-Host "Pressione Enter para sair..."
