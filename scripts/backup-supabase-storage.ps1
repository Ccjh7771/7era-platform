param()

$ErrorActionPreference = "Stop"
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$storageOutput = Join-Path $repoRoot "backups\$timestamp\storage"

$projectUrl = Read-Host "Supabase project URL (https://PROJECT.supabase.co)"
$secureServiceKey = Read-Host "Supabase service role key" -AsSecureString
$serviceKeyPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureServiceKey)

try {
  $serviceKey = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($serviceKeyPointer)
  if ([string]::IsNullOrWhiteSpace($projectUrl) -or [string]::IsNullOrWhiteSpace($serviceKey)) {
    throw "Project URL and service role key are required."
  }

  $env:SUPABASE_BACKUP_URL = $projectUrl
  $env:SUPABASE_BACKUP_SERVICE_ROLE_KEY = $serviceKey
  $env:SUPABASE_BACKUP_OUTPUT = $storageOutput

  node (Join-Path $PSScriptRoot "backup-supabase-storage.mjs")
  if ($LASTEXITCODE -ne 0) { throw "Storage backup failed." }

  Write-Host "Storage backup completed: $storageOutput"
}
finally {
  Remove-Item Env:SUPABASE_BACKUP_URL -ErrorAction SilentlyContinue
  Remove-Item Env:SUPABASE_BACKUP_SERVICE_ROLE_KEY -ErrorAction SilentlyContinue
  Remove-Item Env:SUPABASE_BACKUP_OUTPUT -ErrorAction SilentlyContinue
  if ($serviceKeyPointer -ne [IntPtr]::Zero) {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($serviceKeyPointer)
  }
  $serviceKey = $null
  $secureServiceKey = $null
}
