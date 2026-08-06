# 7ERA Backup and Recovery

## Current protection

- Supabase project: `imkfmynzsnjckdzctwpp`
- Region: Singapore (`ap-southeast-1`)
- Plan: Free
- Automated daily backups: unavailable on the Free Plan
- Schema recovery: 31 migration files are committed under `supabase/migrations`
- Storage objects must be backed up separately from the Postgres database

## Weekly backup

1. Open Docker Desktop.
2. In Supabase Dashboard, open **Connect** and copy the Session pooler connection string.
3. Run:

   ```powershell
   powershell -ExecutionPolicy Bypass -File scripts\backup-supabase.ps1
   ```

4. Paste the connection string only into the secure prompt. Do not save it in a file or Git.
5. In Supabase Dashboard, copy the project URL and service role key, then run:

   ```powershell
   powershell -ExecutionPolicy Bypass -File scripts\backup-supabase-storage.ps1
   ```

6. Move the resulting timestamped folder from `backups` to encrypted cloud storage or an encrypted external drive.

Each database backup contains `roles.sql`, `schema.sql`, `data.sql`, and SHA-256 checksums. The Storage backup contains every object plus a manifest with file sizes and checksums. The local `backups` directory is ignored by Git.

## Restore procedure

Restore into a new Supabase project first. Do not overwrite production until the restored copy is verified.

1. Create the replacement project in Singapore.
2. Enable any required extensions and copy Auth provider settings.
3. Use the new project's Session pooler connection string.
4. Restore in one transaction:

   ```powershell
   psql --single-transaction --variable ON_ERROR_STOP=1 --file roles.sql --file schema.sql --command "SET session_replication_role = replica" --file data.sql --dbname "NEW_CONNECTION_STRING"
   ```

5. Re-upload Storage files into their original bucket names.
6. Verify Auth users, members, points, claims, spins, chats, RLS policies, and Storage object counts.
7. Update Vercel Supabase environment variables only after verification.
8. Require all users to sign in again after switching projects.

## Recommended schedule

- Every week: complete database and Storage export
- Before every schema migration: complete database export
- After major content uploads: Storage export
- Keep at least four weekly copies in a location outside Supabase

## Paid protection option

Pro projects receive seven days of daily backups. Point-in-Time Recovery is a separate paid add-on and requires at least Small compute. Upgrade only when losing up to one day of member activity is no longer acceptable.
