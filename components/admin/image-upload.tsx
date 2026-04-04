"use client";

import { useCallback, useRef, useState } from "react";
import { uploadFile } from "@/app/actions/storage";
import {
  Upload,
  Loader2,
  Trash2,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";

type Bucket = "avatars" | "blog-images" | "documents" | "case-study-assets";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  bucket?: Bucket;
  folder?: string;
  label?: string;
  accept?: string;
  maxSizeMb?: number;
}

const MAX_DEFAULT_MB = 5;

async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function ImageUpload({
  value,
  onChange,
  bucket = "blog-images",
  folder = "uploads",
  label = "Image",
  accept = "image/*",
  maxSizeMb = MAX_DEFAULT_MB,
}: ImageUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const upload = useCallback(
    async (file: File) => {
      setError(null);

      if (file.size > maxSizeMb * 1024 * 1024) {
        setError(`File too large. Max ${maxSizeMb}MB.`);
        return;
      }

      if (accept !== "*" && !file.type.startsWith("image/")) {
        setError("Only image files are allowed.");
        return;
      }

      setUploading(true);

      try {
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const base64 = await fileToBase64(file);

        const { url, error: uploadError } = await uploadFile(bucket, path, base64, file.type);

        if (uploadError) {
          setError(uploadError);
          return;
        }

        if (url) onChange(url);
      } catch {
        setError("Upload failed. Please try again.");
      } finally {
        setUploading(false);
        if (fileRef.current) fileRef.current.value = "";
      }
    },
    [bucket, folder, accept, maxSizeMb, onChange]
  );

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) upload(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) upload(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave() {
    setDragOver(false);
  }

  function handleRemove() {
    setError(null);
    onChange("");
  }

  return (
    <div>
      {label && (
        <label className="text-xs font-medium text-muted-foreground">
          {label}
        </label>
      )}

      <div className="mt-1 flex gap-2">
        <input
          value={value}
          onChange={(e) => {
            setError(null);
            onChange(e.target.value);
          }}
          placeholder="Paste URL or upload a file"
          className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border px-3 text-sm text-foreground hover:bg-muted disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          Upload
        </button>
        <input
          ref={fileRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {!value && !uploading && (
        <div
          ref={dropRef}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileRef.current?.click()}
          className={`mt-2 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed py-8 transition-colors ${
            dragOver
              ? "border-accent bg-accent/5"
              : "border-border hover:border-muted-foreground/40"
          }`}
        >
          <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
          <p className="mt-2 text-sm text-muted-foreground">
            Drag & drop or{" "}
            <span className="font-medium text-accent">browse</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            Max {maxSizeMb}MB
          </p>
        </div>
      )}

      {uploading && (
        <div className="mt-2 flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-4 py-3">
          <Loader2 className="h-4 w-4 animate-spin text-accent" />
          <p className="text-sm text-muted-foreground">Uploading...</p>
        </div>
      )}

      {value && !uploading && (
        <div className="relative mt-2 overflow-hidden rounded-lg border border-border">
          <img
            src={value}
            alt="Preview"
            className="h-36 w-full object-cover"
            onError={() => setError("Failed to load image preview.")}
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute right-2 top-2 rounded-full bg-card/90 p-1.5 text-destructive shadow-sm transition-colors hover:bg-card"
            title="Remove image"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {error && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
