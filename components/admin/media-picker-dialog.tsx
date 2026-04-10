"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X, Search, Loader2, Image as ImageIcon } from "lucide-react";
import { listAllFiles, type StorageFile } from "@/app/actions/storage";
import { cn } from "@/lib/utils";

interface MediaPickerDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  /** Filter to specific buckets (default: all) */
  buckets?: string[];
}

export function MediaPickerDialog({
  open,
  onClose,
  onSelect,
  buckets,
}: MediaPickerDialogProps) {
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    listAllFiles()
      .then((data) => setFiles(data.filter((f) => f.mimetype.startsWith("image/"))))
      .catch(() => setFiles([]))
      .finally(() => setLoading(false));
  }, [open]);

  if (!open) return null;

  const filtered = files.filter((f) => {
    if (buckets?.length && !buckets.includes(f.bucket)) return false;
    if (search.trim()) return f.name.toLowerCase().includes(search.toLowerCase());
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="mx-4 flex max-h-[80vh] w-full max-w-2xl flex-col rounded-2xl border border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h3 className="text-sm font-semibold">Pick from Media Library</h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search */}
        <div className="border-b border-border px-5 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search images..."
              className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {filtered.map((file) => (
                <button
                  key={file.id}
                  type="button"
                  onClick={() => {
                    onSelect(file.url);
                    onClose();
                  }}
                  className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted transition-all hover:border-accent hover:ring-2 hover:ring-accent/30"
                >
                  <Image
                    src={file.url}
                    alt={file.name}
                    fill
                    sizes="(max-width: 640px) 33vw, 25vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-1.5 pb-1.5 pt-4 opacity-0 transition-opacity group-hover:opacity-100">
                    <p className="truncate text-xs text-white">
                      {file.name.split("/").pop()}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-16 text-center">
              <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                {search ? "No images match your search." : "No images in library."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
