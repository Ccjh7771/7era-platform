param()

$ErrorActionPreference = "Stop"
$projectRef = "imkfmynzsnjckdzctwpp"
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$backupRoot = Join-Path $repoRoot "backups"
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$outputDir = Join-Path $backupRoot $timestamp

Write-Host "7ERA Supabase database backup"
Write-Host "Project: $projectRef"
Write-Host "Copy the Session pooler connection string from Supabase Dashboard > Connect."
$secureDatabaseUrl = Read-Host "Database connection string" -AsSecureString
$databaseUrlPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureDatabaseUrl)

try {
  $databaseUrl = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($databaseUrlPointer)
  if ([string]::IsNullOrWhiteSpace($databaseUrl)) {
    throw "A database connection string is required."
  }

  New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

  $rolesFile = Join-Path $outputDir "roles.sql"
  $schemaFile = Join-Path $outputDir "schema.sql"
  $dataFile = Join-Path $outputDir "data.sql"

  & npx.cmd --yes supabase@2.111.0 db dump --db-url $databaseUrl --file $rolesFile --role-only
  if ($LASTEXITCODE -ne 0) { throw "Role backup failed." }

  & npx.cmd --yes supabase@2.111.0 db dump --db-url $databaseUrl --file $schemaFile
  if ($LASTEXITCODE -ne 0) { throw "Schema backup failed." }

  & npx.cmd --yes supabase@2.111.0 db dump --db-url $databaseUrl --file $dataFile --use-copy --data-only -x "storage.buckets_vectors" -x "storage.vector_indexes"
  if ($LASTEXITCODE -ne 0) { throw "Data backup failed." }

  $checksums = Get-FileHash -Algorithm SHA256 $rolesFile, $schemaFile, $dataFile |
    ForEach-Object { "$($_.Hash.ToLowerInvariant())  $([IO.Path]::GetFileName($_.Path))" }
  Set-Content -LiteralPath (Join-Path $outputDir "checksums.sha256") -Value $checksums -Encoding utf8

  Write-Host "Database backup completed: $outputDir"
  Write-Host "Run scripts\backup-supabase-storage.ps1 to back up Storage objects."
}
finally {
  if ($databaseUrlPointer -ne [IntPtr]::Zero) {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($databaseUrlPointer)
  }
  $databaseUrl = $null
  $secureDatabaseUrl = $null
}
