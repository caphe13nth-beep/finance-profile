"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type DragEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  Upload,
  Loader2,
  Trash2,
  X,
  Check,
  Image as ImageIcon,
  Move,
} from "lucide-react";
import { uploadFile } from "@/app/actions/storage";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { cn } from "@/lib/utils";

// ── Helpers ────────────────────────────────────────

async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ── Crop Modal ─────────────────────────────────────

interface CropModalProps {
  file: File;
  aspect: number; // width / height  (1 = square, 16/9 = wide)
  onConfirm: (croppedFile: File) => void;
  onCancel: () => void;
}

function CropModal({ file, aspect, onConfirm, onCancel }: CropModalProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [naturalW, setNaturalW] = useState(0);
  const [naturalH, setNaturalH] = useState(0);

  // Crop viewport is the visible frame; the image can be dragged behind it.
  // We track the offset of the image relative to the viewport.
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    readFileAsDataUrl(file).then(setPreview);
  }, [file]);

  function onImgLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const img = e.currentTarget;
    setNaturalW(img.naturalWidth);
    setNaturalH(img.naturalHeight);

    // Center the image initially
    const containerW = containerRef.current?.clientWidth ?? 320;
    const containerH = containerW / aspect;
    const imgAspect = img.naturalWidth / img.naturalHeight;

    let displayW: number, displayH: number;
    if (imgAspect > aspect) {
      // Image is wider — fill height, crop sides
      displayH = containerH;
      displayW = containerH * imgAspect;
    } else {
      // Image is taller — fill width, crop top/bottom
      displayW = containerW;
      displayH = containerW / imgAspect;
    }
    setOffset({
      x: (containerW - displayW) / 2,
      y: (containerH - displayH) / 2,
    });
  }

  // The image display dimensions (fit-cover into viewport)
  const containerW = containerRef.current?.clientWidth ?? 320;
  const containerH = containerW / aspect;
  const imgAspect = naturalW / naturalH || 1;
  let displayW: number, displayH: number;
  if (imgAspect > aspect) {
    displayH = containerH;
    displayW = containerH * imgAspect;
  } else {
    displayW = containerW;
    displayH = containerW / imgAspect;
  }

  // Clamp offset so the image always covers the viewport
  function clamp(off: { x: number; y: number }) {
    return {
      x: Math.min(0, Math.max(containerW - displayW, off.x)),
      y: Math.min(0, Math.max(containerH - displayH, off.y)),
    };
  }

  function onPointerDown(e: ReactPointerEvent) {
    e.preventDefault();
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: ReactPointerEvent) {
    if (!dragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setOffset(clamp({ x: dragStart.current.ox + dx, y: dragStart.current.oy + dy }));
  }
  function onPointerUp() {
    setDragging(false);
  }

  async function handleConfirm() {
    if (!preview || !naturalW) return;

    // Calculate the crop rectangle in natural image coordinates
    const scaleX = naturalW / displayW;
    const scaleY = naturalH / displayH;
    const cropX = -offset.x * scaleX;
    const cropY = -offset.y * scaleY;
    const cropW = containerW * scaleX;
    const cropH = containerH * scaleY;

    // Draw the cropped region onto a canvas
    const canvas = document.createElement("canvas");
    const outputW = Math.min(cropW, aspect >= 1.5 ? 1920 : 800);
    const outputH = outputW / aspect;
    canvas.width = outputW;
    canvas.height = outputH;

    const ctx = canvas.getContext("2d")!;
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = preview;
    await new Promise<void>((r) => { img.onload = () => r(); });
    ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, outputW, outputH);

    const blob = await new Promise<Blob>((r) =>
      canvas.toBlob((b) => r(b!), "image/webp", 0.88)
    );
    const croppedFile = new File([blob], file.name.replace(/\.[^.]+$/, ".webp"), {
      type: "image/webp",
    });
    onConfirm(croppedFile);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-lg rounded-2xl border border-border bg-card p-5 shadow-2xl">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-medium">
            Drag to reposition
          </p>
          <button onClick={onCancel} className="rounded-full p-1 hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Crop viewport */}
        <div
          ref={containerRef}
          className="relative w-full cursor-grab overflow-hidden rounded-xl border-2 border-dashed border-accent/40 active:cursor-grabbing"
          style={{ aspectRatio: `${aspect}` }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          {preview && (
            <img
              src={preview}
              alt="Crop preview"
              draggable={false}
              onLoad={onImgLoad}
              className="pointer-events-none absolute select-none"
              style={{
                width: displayW,
                height: displayH,
                transform: `translate(${offset.x}px, ${offset.y}px)`,
              }}
            />
          )}

          {/* Center crosshair hint */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <Move className="h-6 w-6 text-white/40 drop-shadow" />
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent/80"
          >
            <Check className="h-4 w-4" />
            Crop & Upload
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Dropzone ───────────────────────────────────────

interface DropzoneProps {
  label: string;
  hint: string;
  aspect: number;
  value: string | null;
  uploading: boolean;
  onFile: (file: File) => void;
  onRemove: () => void;
  children?: React.ReactNode; // live preview slot
  className?: string;
}

function Dropzone({
  label,
  hint,
  aspect,
  value,
  uploading,
  onFile,
  onRemove,
  children,
  className,
}: DropzoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) onFile(file);
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onFile(file);
    e.target.value = "";
  }

  return (
    <div className={className}>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>

      {value && !uploading ? (
        <div className="relative mt-1.5">
          {children ?? (
            <div className="overflow-hidden rounded-xl border border-border">
              <img
                src={value}
                alt={label}
                className="w-full object-cover"
                style={{ aspectRatio: `${aspect}` }}
              />
            </div>
          )}
          <button
            type="button"
            onClick={onRemove}
            className="absolute right-2 top-2 rounded-full bg-card/90 p-1.5 text-destructive shadow-sm transition-colors hover:bg-card"
            title="Remove"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={() => setDragOver(false)}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "mt-1.5 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors",
            dragOver
              ? "border-accent bg-accent/5"
              : "border-border hover:border-muted-foreground/40",
          )}
          style={{ aspectRatio: `${aspect}` }}
        >
          {uploading ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin text-accent" />
              <p className="mt-2 text-xs text-muted-foreground">Uploading...</p>
            </>
          ) : (
            <>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                {aspect === 1 ? (
                  <Upload className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Drop image or <span className="font-medium text-accent">browse</span>
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground/60">{hint}</p>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}

// ── Main Export ─────────────────────────────────────

interface AvatarCoverUploadProps {
  avatarUrl: string | null;
  coverUrl: string | null;
  avatarShape: string;
  onAvatarChange: (url: string | null) => void;
  onCoverChange: (url: string | null) => void;
}

export function AvatarCoverUpload({
  avatarUrl,
  coverUrl,
  avatarShape,
  onAvatarChange,
  onCoverChange,
}: AvatarCoverUploadProps) {
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [cropTarget, setCropTarget] = useState<"avatar" | "cover" | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const doUpload = useCallback(
    async (
      file: File,
      bucket: "avatars" | "blog-images",
      folder: string,
      setUploading: (v: boolean) => void,
      onChange: (url: string | null) => void,
    ) => {
      setUploading(true);
      try {
        const ext = file.name.split(".").pop() ?? "webp";
        const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const base64 = await fileToBase64(file);
        const { url } = await uploadFile(bucket, path, base64, file.type);
        if (url) onChange(url);
      } finally {
        setUploading(false);
      }
    },
    [],
  );

  function openCrop(file: File, target: "avatar" | "cover") {
    setCropFile(file);
    setCropTarget(target);
  }

  function handleCropConfirm(croppedFile: File) {
    setCropFile(null);
    if (cropTarget === "avatar") {
      doUpload(croppedFile, "avatars", "profile", setUploadingAvatar, onAvatarChange);
    } else {
      doUpload(croppedFile, "blog-images", "covers", setUploadingCover, onCoverChange);
    }
    setCropTarget(null);
  }

  function handleCropCancel() {
    setCropFile(null);
    setCropTarget(null);
  }

  return (
    <>
      <div className="grid grid-cols-[1fr_2fr] gap-4">
        {/* Avatar dropzone — square, with ProfileAvatar preview */}
        <Dropzone
          label="Profile Avatar"
          hint="Square, max 5 MB"
          aspect={1}
          value={avatarUrl}
          uploading={uploadingAvatar}
          onFile={(f) => openCrop(f, "avatar")}
          onRemove={() => onAvatarChange(null)}
        >
          {avatarUrl && (
            <div className="flex items-center justify-center rounded-xl border border-border bg-muted/30 p-4" style={{ aspectRatio: "1" }}>
              <ProfileAvatar
                src={avatarUrl}
                fallback="Me"
                size="xl"
                shape={avatarShape as "circle" | "squircle" | "hexagon"}
              />
            </div>
          )}
        </Dropzone>

        {/* Cover dropzone — 16:9, with image preview */}
        <Dropzone
          label="Cover Image"
          hint="16:9, max 5 MB"
          aspect={16 / 9}
          value={coverUrl}
          uploading={uploadingCover}
          onFile={(f) => openCrop(f, "cover")}
          onRemove={() => onCoverChange(null)}
        />
      </div>

      {/* Crop modal */}
      {cropFile && cropTarget && (
        <CropModal
          file={cropFile}
          aspect={cropTarget === "avatar" ? 1 : 16 / 9}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}
    </>
  );
}
