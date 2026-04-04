"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  listAllFiles, deleteFile, uploadFile,
  type StorageFile, type BucketName,
} from "@/app/actions/storage";
import { useToast } from "@/components/toast";
import {
  Search, Upload, Trash2, Copy, Loader2,
  FileText, Image as ImageIcon, File,
} from "lucide-react";

const BUCKETS: BucketName[] = ["avatars", "blog-images", "documents", "case-study-assets"];

function formatSize(bytes: number): string {
  if (bytes === 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function isImage(mimetype: string): boolean {
  return mimetype.startsWith("image/");
}

export default function AdminMediaLibraryPage() {
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [bucketFilter, setBucketFilter] = useState<BucketName | "all">("all");
  const [uploading, setUploading] = useState(false);
  const [uploadBucket, setUploadBucket] = useState<BucketName>("blog-images");
  const [pending, start] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  async function load() {
    setLoading(true);
    try {
      const data = await listAllFiles();
      setFiles(data);
    } catch {
      toast("Failed to load files", "error");
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function copyUrl(url: string) {
    navigator.clipboard.writeText(url);
    toast("URL copied to clipboard", "success");
  }

  function handleDelete(file: StorageFile) {
    if (!confirm(`Delete ${file.name}?`)) return;
    start(async () => {
      const { error } = await deleteFile(file.bucket, file.name);
      if (error) {
        toast(`Delete failed: ${error}`, "error");
      } else {
        toast("File deleted", "success");
        load();
      }
    });
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const fileList = e.target.files;
    if (!fileList?.length) return;

    setUploading(true);
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const ext = file.name.split(".").pop() ?? "bin";
      const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      // Convert to base64 for server action
      const buffer = await file.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
      );

      const { error } = await uploadFile(uploadBucket, path, base64, file.type);
      if (error) {
        toast(`Upload failed: ${error}`, "error");
      }
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
    toast("Upload complete", "success");
    load();
  }

  // Filter
  const filtered = files.filter((f) => {
    if (bucketFilter !== "all" && f.bucket !== bucketFilter) return false;
    if (search.trim()) return f.name.toLowerCase().includes(search.toLowerCase());
    return true;
  });

  return (
    <AdminShell
      title="Media Library"
      description={`${files.length} files across ${BUCKETS.length} buckets`}
      actions={
        <div className="flex items-center gap-2">
          <select
            value={uploadBucket}
            onChange={(e) => setUploadBucket(e.target.value as BucketName)}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {BUCKETS.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent/80 disabled:opacity-50"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Upload
          </button>
          <input ref={fileRef} type="file" multiple className="hidden" onChange={handleUpload} />
        </div>
      }
    >
      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search files..."
            className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setBucketFilter("all")}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              bucketFilter === "all" ? "bg-accent text-white" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            All ({files.length})
          </button>
          {BUCKETS.map((b) => {
            const count = files.filter((f) => f.bucket === b).length;
            return (
              <button
                key={b}
                onClick={() => setBucketFilter(b)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  bucketFilter === b ? "bg-accent text-white" : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {b} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* File grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((file) => (
            <div
              key={file.id}
              className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-accent/40"
            >
              {/* Preview */}
              <div className="relative aspect-square bg-muted">
                {isImage(file.mimetype) ? (
                  <Image
                    src={file.url}
                    alt={file.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground/40">
                    {file.mimetype.includes("pdf") ? (
                      <FileText className="h-10 w-10" />
                    ) : (
                      <File className="h-10 w-10" />
                    )}
                    <span className="text-xs uppercase">
                      {file.name.split(".").pop()}
                    </span>
                  </div>
                )}

                {/* Hover actions */}
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => copyUrl(file.url)}
                    className="rounded-full bg-white/20 p-2 text-white hover:bg-white/40"
                    title="Copy URL"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(file)}
                    disabled={pending}
                    className="rounded-full bg-white/20 p-2 text-white hover:bg-red-500/80"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-2.5">
                <p className="truncate text-xs font-medium text-foreground" title={file.name}>
                  {file.name.split("/").pop()}
                </p>
                <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="rounded bg-muted px-1.5 py-0.5">{file.bucket}</span>
                  <span>{formatSize(file.size)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
          <ImageIcon className="h-10 w-10 text-muted-foreground/30" />
          <p className="text-muted-foreground">
            {search ? "No files match your search." : "No files uploaded yet."}
          </p>
        </div>
      )}
    </AdminShell>
  );
}
