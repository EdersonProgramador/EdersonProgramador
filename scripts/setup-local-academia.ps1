# Configura Postgres local (PG 17 :5432), migra, seed e sync Tanar; liga o Vite à API :3333.
# Uso: .\scripts\setup-local-academia.ps1
#      .\scripts\setup-local-academia.ps1 -PostgresPassword 'sua_senha'

param(
  [string]$PostgresPassword = $env:LOCAL_POSTGRES_PASSWORD
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$envFile = Join-Path $repoRoot ".env"
$apiEnvFile = Join-Path $repoRoot "apps\api\.env"
$psql = "C:\Program Files\PostgreSQL\17\bin\psql.exe"
$createdb = "C:\Program Files\PostgreSQL\17\bin\createdb.exe"

if (-not (Test-Path $psql)) {
  Write-Error "PostgreSQL 17 não encontrado em $psql. Ajuste o caminho no script ou instale o PG 17."
}

if (-not $PostgresPassword) {
  if (Test-Path $envFile) {
    foreach ($line in Get-Content $envFile) {
      if ($line -match '^\s*LOCAL_POSTGRES_PASSWORD=(.+)$') {
        $PostgresPassword = $Matches[1].Trim().Trim('"')
        break
      }
    }
  }
}

if (-not $PostgresPassword) {
  Write-Host @"

Defina a senha do usuário postgres (instalação PostgreSQL 17, porta 5432):

  1. Edite $envFile
  2. Adicione ou preencha: LOCAL_POSTGRES_PASSWORD=sua_senha
  3. Rode de novo: .\scripts\setup-local-academia.ps1

Ou: .\scripts\setup-local-academia.ps1 -PostgresPassword 'sua_senha'

"@
  exit 1
}

$encoded = [uri]::EscapeDataString($PostgresPassword)
$dbUrl = "postgresql://postgres:${encoded}@127.0.0.1:5432/ederson_agencia?schema=public"

$env:PGPASSWORD = $PostgresPassword
Write-Host "Testando conexão em 127.0.0.1:5432..."
& $psql -h 127.0.0.1 -p 5432 -U postgres -d postgres -c "SELECT 1" | Out-Null
if ($LASTEXITCODE -ne 0) {
  Write-Error "Senha ou conexão recusada. Confira LOCAL_POSTGRES_PASSWORD (senha definida na instalação do PG 17)."
}

$dbExists = & $psql -h 127.0.0.1 -p 5432 -U postgres -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='ederson_agencia'"
if ($dbExists -ne "1") {
  Write-Host "Criando banco ederson_agencia..."
  & $createdb -h 127.0.0.1 -p 5432 -U postgres ederson_agencia
}

function Set-EnvLine($path, $key, $value) {
  $lines = @()
  $found = $false
  if (Test-Path $path) {
    foreach ($line in Get-Content $path) {
      if ($line -match "^$key=") {
        $lines += "$key=$value"
        $found = $true
      } else {
        $lines += $line
      }
    }
  }
  if (-not $found) { $lines += "$key=$value" }
  Set-Content -Path $path -Value $lines -Encoding utf8
}

Set-EnvLine $envFile "DATABASE_URL" $dbUrl
Set-EnvLine $apiEnvFile "DATABASE_URL" $dbUrl
Set-EnvLine $envFile "VITE_DEV_API_TARGET" "http://127.0.0.1:3333"
Set-EnvLine $envFile "VITE_DEV_API_USE_LOCAL" "true"

$env:DATABASE_URL = $dbUrl
Push-Location $repoRoot
try {
  Write-Host "Prisma migrate deploy..."
  npm run prisma:deploy --workspace @ederson-agencia/api
  Write-Host "Seed..."
  npm run prisma:seed --workspace @ederson-agencia/api
  Write-Host "Sync Tanar (30 aulas Salmos)..."
  npm run sync:tanar
} finally {
  Pop-Location
  Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
}

Write-Host @"

Pronto. Reinicie o dev (Ctrl+C e npm run dev).
Login local: admin@ederson.dev / admin123456 (se .env padrão)
Tanar: http://localhost:5174/academia/cursos/tanar — Salmos deve listar Day 1–30.

"@
