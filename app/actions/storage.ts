"use server";

import { createAdminClient } from "@/lib/supabase/admin";

const BUCKETS = ["avatars", "blog-images", "documents", "case-study-assets"] as const;
export type BucketName = (typeof BUCKETS)[number];

export interface StorageFile {
  id: string;
  name: string;
  bucket: BucketName;
  size: number;
  mimetype: string;
  url: string;
  created_at: string;
}

export async function listAllFiles(): Promise<StorageFile[]> {
  const supabase = createAdminClient();
  const allFiles: StorageFile[] = [];

  for (const bucket of BUCKETS) {
    try {
      const { data } = await supabase.storage.from(bucket).list("", {
        limit: 200,
        sortBy: { column: "created_at", order: "desc" },
      });

      if (data) {
        // list() returns folders too — filter to actual files
        const files = data.filter((f) => f.id);
        for (const f of files) {
          const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(f.name);
          allFiles.push({
            id: `${bucket}/${f.name}`,
            name: f.name,
            bucket,
            size: f.metadata?.size ?? 0,
            mimetype: f.metadata?.mimetype ?? "unknown",
            url: publicUrl,
            created_at: f.created_at ?? "",
          });
        }

        // Also list files in subfolders
        const folders = data.filter((f) => !f.id);
        for (const folder of folders) {
          const { data: subFiles } = await supabase.storage.from(bucket).list(folder.name, {
            limit: 200,
            sortBy: { column: "created_at", order: "desc" },
          });
          if (subFiles) {
            for (const f of subFiles.filter((sf) => sf.id)) {
              const path = `${folder.name}/${f.name}`;
              const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
              allFiles.push({
                id: `${bucket}/${path}`,
                name: path,
                bucket,
                size: f.metadata?.size ?? 0,
                mimetype: f.metadata?.mimetype ?? "unknown",
                url: publicUrl,
                created_at: f.created_at ?? "",
              });
            }
          }
        }
      }
    } catch {
      // Bucket may not exist yet — skip
    }
  }

  return allFiles.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function deleteFile(bucket: string, path: string): Promise<{ error: string | null }> {
  const supabase = createAdminClient();
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) return { error: error.message };
  return { error: null };
}

export async function uploadFile(
  bucket: string,
  path: string,
  fileBase64: string,
  contentType: string
): Promise<{ url: string | null; error: string | null }> {
  const supabase = createAdminClient();
  const buffer = Buffer.from(fileBase64, "base64");
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, buffer, { contentType, upsert: true });

  if (error) return { url: null, error: error.message };

  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
  return { url: publicUrl, error: null };
}
