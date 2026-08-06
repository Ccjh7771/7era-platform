import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve, sep } from "node:path";
import { createClient } from "@supabase/supabase-js";

const projectUrl = process.env.SUPABASE_BACKUP_URL;
const serviceRoleKey = process.env.SUPABASE_BACKUP_SERVICE_ROLE_KEY;
const outputDirectory = process.env.SUPABASE_BACKUP_OUTPUT;

if (!projectUrl || !serviceRoleKey || !outputDirectory) {
  throw new Error("Missing secure backup environment variables.");
}

const supabase = createClient(projectUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function listFiles(bucketName) {
  const files = [];
  const folders = [""];

  while (folders.length > 0) {
    const prefix = folders.shift();
    let offset = 0;

    while (true) {
      const { data, error } = await supabase.storage.from(bucketName).list(prefix, {
        limit: 100,
        offset,
        sortBy: { column: "name", order: "asc" },
      });
      if (error) throw error;

      for (const entry of data ?? []) {
        const objectPath = prefix ? `${prefix}/${entry.name}` : entry.name;
        if (entry.id) files.push(objectPath);
        else folders.push(objectPath);
      }

      if (!data || data.length < 100) break;
      offset += data.length;
    }
  }

  return files;
}

const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
if (bucketError) throw bucketError;

const resolvedOutput = resolve(outputDirectory);
await mkdir(resolvedOutput, { recursive: true });
const manifest = { createdAt: new Date().toISOString(), projectUrl, buckets: [] };

for (const bucket of buckets ?? []) {
  const bucketRoot = resolve(resolvedOutput, bucket.name);
  const objectPaths = await listFiles(bucket.name);
  const savedFiles = [];

  for (const objectPath of objectPaths) {
    const destination = resolve(bucketRoot, ...objectPath.split("/"));
    if (!destination.startsWith(`${bucketRoot}${sep}`)) {
      throw new Error(`Unsafe Storage object path: ${objectPath}`);
    }

    const { data, error } = await supabase.storage.from(bucket.name).download(objectPath);
    if (error) throw error;
    const bytes = Buffer.from(await data.arrayBuffer());
    await mkdir(resolve(destination, ".."), { recursive: true });
    await writeFile(destination, bytes);

    savedFiles.push({
      path: objectPath,
      bytes: bytes.length,
      sha256: createHash("sha256").update(bytes).digest("hex"),
    });
  }

  manifest.buckets.push({
    id: bucket.id,
    name: bucket.name,
    public: bucket.public,
    files: savedFiles,
  });
}

await writeFile(
  resolve(resolvedOutput, "manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
  "utf8",
);

console.log(`Backed up ${manifest.buckets.reduce((total, bucket) => total + bucket.files.length, 0)} Storage object(s).`);
