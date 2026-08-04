# Production backup and recovery

This runbook protects the 7ERA CMS database and public Supabase Storage files while the project is on the Supabase Free plan.

## Recovery targets

- Recovery point objective: 24 hours after the scheduled workflow is enabled.
- Recovery time objective: 2 hours for a small project after a replacement Supabase project is available.
- Retention: up to 30 days of encrypted archives in GitHub Actions.
- Backup location: GitHub Actions artifacts, outside the Supabase project.

## What each archive contains

- database roles exported by the Supabase CLI;
- application schema, functions, triggers, policies and grants;
- database rows, including Auth and Storage metadata supported by the CLI export;
- every object in a public Supabase Storage bucket;
- SHA-256 checksums for the plaintext backup set and encrypted archive.

The repository already contains the ordered files in `supabase/migrations/`. They are a second source for rebuilding the application schema, but migrations are not a replacement for production data backups.

## One-time activation

Create these encrypted repository secrets under **GitHub → 7era-platform → Settings → Secrets and variables → Actions**:

1. `SUPABASE_DB_URL`: the Supabase Session Pooler connection string from **Supabase → Connect**. Use the database password in the connection string and percent-encode special characters in the password.
2. `BACKUP_ENCRYPTION_PASSWORD`: a unique recovery password of at least 24 random characters. Store a second copy in the owner's password manager; GitHub will not reveal it later.

Then open **GitHub → Actions → Supabase encrypted backup → Run workflow**. The first successful manual run activates and validates the process. The workflow subsequently runs every day at 02:15 Asia/Kuala_Lumpur time.

Never paste either secret into a ticket, commit, build log or chat message.

## Daily verification

A healthy run produces one artifact named `7era-supabase-<UTC timestamp>` containing:

- `7era-supabase-<timestamp>.tar.gz.enc`
- `7era-supabase-<timestamp>.tar.gz.enc.sha256`

GitHub reports a failed workflow if credentials are missing, the database export fails, a public Storage object cannot be downloaded, encryption fails or the artifact is missing.

## Quarterly recovery drill

Perform recovery tests on a new disposable Supabase project. Never test a restore against production.

1. Download the latest encrypted artifact and verify its checksum.
2. Decrypt it locally:

   ```sh
   openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 \
     -in 7era-supabase-<timestamp>.tar.gz.enc \
     -out 7era-supabase-<timestamp>.tar.gz \
     -pass env:BACKUP_ENCRYPTION_PASSWORD
   ```

3. Extract the archive and verify the internal checksums:

   ```sh
   tar -xzf 7era-supabase-<timestamp>.tar.gz
   sha256sum --check backup/SHA256SUMS
   ```

4. Restore roles, schema and data to the disposable project's Session Pooler connection:

   ```sh
   psql \
     --single-transaction \
     --variable ON_ERROR_STOP=1 \
     --file backup/database/roles.sql \
     --file backup/database/schema.sql \
     --command 'SET session_replication_role = replica' \
     --file backup/database/data.sql \
     --dbname "$RESTORE_DB_URL"
   ```

5. Re-upload every file described in `backup/storage-manifest.json` to the same bucket and object name.
6. Recreate environment variables and Auth provider settings. Existing sessions should be considered invalid; require administrators to sign in again.
7. Verify row counts, RLS policies, administrator login, public pages and Storage URLs before declaring the drill successful.
8. Delete the disposable project only after recording the drill date and result.

## Incident recovery order

1. Stop administrator content changes and record the incident time.
2. Preserve the latest successful backup artifact and Vercel/Supabase logs.
3. Create a replacement Supabase project instead of overwriting the damaged production project.
4. Restore and verify the replacement project using the quarterly drill procedure.
5. Update Vercel environment variables to the verified replacement project.
6. Deploy, run the full public and administrator acceptance tests, then reopen content editing.

Storage binary data is separate from database metadata, which is why the workflow exports both.
