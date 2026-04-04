"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import {
  adminCreate,
  adminUpdate,
  adminDeleteRow,
} from "@/app/actions/admin-crud";
import { AdminShell } from "@/components/admin/admin-shell";
import { FormModal } from "@/components/admin/form-modal";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Search,
  Clock,
  Archive,
  FileEdit,
} from "lucide-react";
import { MdxEditor } from "@/components/admin/mdx-editor";
import { ImageUpload } from "@/components/admin/image-upload";

// ── Types ──────────────────────────────────────────
type PostStatus = "draft" | "scheduled" | "published" | "archived";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  body: string | null;
  category: string | null;
  tags: string[] | null;
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
  scheduled_at: string | null;
  status: PostStatus;
  reading_time_min: number | null;
  created_at: string;
}

// ── Zod schema ─────────────────────────────────────
const postSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase with hyphens only"),
  excerpt: z.string().optional(),
  featured_image: z.string().optional(),
  body: z.string().optional(),
  category: z.string().optional(),
  tags: z.string().optional(),
  reading_time_min: z.string().optional(),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
  status: z.enum(["draft", "scheduled", "published", "archived"]),
  scheduled_at: z.string().optional(),
});

type PostFormValues = z.infer<typeof postSchema>;

// ── Styles ─────────────────────────────────────────
const inputCls =
  "mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring";
const labelCls = "text-xs font-medium text-muted-foreground";
const textareaCls =
  "mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";
const errorCls = "mt-1 text-xs text-destructive";

// ── Status display ─────────────────────────────────
const STATUS_CONFIG: Record<PostStatus, { label: string; icon: typeof Eye; cls: string }> = {
  draft: { label: "Draft", icon: FileEdit, cls: "bg-muted text-muted-foreground" },
  scheduled: { label: "Scheduled", icon: Clock, cls: "bg-chart-2/10 text-chart-2" },
  published: { label: "Published", icon: Eye, cls: "bg-accent/10 text-accent" },
  archived: { label: "Archived", icon: Archive, cls: "bg-destructive/10 text-destructive" },
};

// ── Post form component ────────────────────────────
function PostForm({
  defaultValues,
  onSubmit,
  onCancel,
  isPending,
}: {
  defaultValues: Partial<Post> | null;
  onSubmit: (data: PostFormValues) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      slug: defaultValues?.slug ?? "",
      excerpt: defaultValues?.excerpt ?? "",
      featured_image: defaultValues?.featured_image ?? "",
      body: defaultValues?.body ?? "",
      category: defaultValues?.category ?? "",
      tags: (defaultValues?.tags ?? []).join(", "),
      reading_time_min: defaultValues?.reading_time_min != null ? String(defaultValues.reading_time_min) : "",
      seo_title: defaultValues?.seo_title ?? "",
      seo_description: defaultValues?.seo_description ?? "",
      status: defaultValues?.status ?? "draft",
      scheduled_at: defaultValues?.scheduled_at ? defaultValues.scheduled_at.slice(0, 16) : "",
    },
  });

  const featuredImage = watch("featured_image") ?? "";
  const currentStatus = watch("status");

  // Auto-generate slug from title for new posts
  const titleValue = watch("title");
  useEffect(() => {
    if (!defaultValues?.id && titleValue) {
      const slug = titleValue
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setValue("slug", slug);
    }
  }, [titleValue, defaultValues?.id, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className={labelCls}>Title <span className="text-destructive">*</span></label>
        <input {...register("title")} className={inputCls} />
        {errors.title && <p className={errorCls}>{errors.title.message}</p>}
      </div>

      <div>
        <label className={labelCls}>Slug <span className="text-destructive">*</span></label>
        <input {...register("slug")} className={inputCls} placeholder="my-article-slug" />
        {errors.slug && <p className={errorCls}>{errors.slug.message}</p>}
      </div>

      <div><label className={labelCls}>Category</label><input {...register("category")} className={inputCls} /></div>
      <div><label className={labelCls}>Excerpt</label><textarea {...register("excerpt")} rows={2} className={textareaCls} /></div>

      <div>
        <label className={labelCls}>Body (MDX)</label>
        <div className="mt-1">
          <MdxEditor value={watch("body") ?? ""} onChange={(val) => setValue("body", val)} />
        </div>
      </div>

      <ImageUpload
        value={featuredImage}
        onChange={(url) => setValue("featured_image", url)}
        bucket="blog-images"
        folder="posts"
        label="Featured Image"
      />

      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>Tags (comma separated)</label><input {...register("tags")} className={inputCls} /></div>
        <div><label className={labelCls}>Reading Time (min)</label><input type="number" {...register("reading_time_min")} className={inputCls} min={1} /></div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>SEO Title</label><input {...register("seo_title")} className={inputCls} /></div>
        <div><label className={labelCls}>SEO Description</label><input {...register("seo_description")} className={inputCls} /></div>
      </div>

      {/* Status + Scheduled At */}
      <fieldset className="space-y-3 rounded-lg border border-border p-4">
        <legend className="px-2 text-xs font-semibold text-muted-foreground">Publishing</legend>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Status</label>
            <select {...register("status")} className={inputCls}>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          {currentStatus === "scheduled" && (
            <div>
              <label className={labelCls}>Scheduled For</label>
              <input type="datetime-local" {...register("scheduled_at")} className={inputCls} />
            </div>
          )}
        </div>
      </fieldset>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
        <button type="submit" disabled={isPending} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent/80 disabled:opacity-50">
          {isPending ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}

// ── Main page ──────────────────────────────────────
export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PostStatus | "all">("all");
  const [modal, setModal] = useState<{ open: boolean; post: Partial<Post> | null }>({ open: false, post: null });
  const [pending, startTransition] = useTransition();

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
    setPosts(data ?? []);
  }, []);

  useEffect(() => { load(); }, [load]);

  function openNew() { setModal({ open: true, post: {} }); }
  function openEdit(p: Post) { setModal({ open: true, post: { ...p } }); }
  function close() { setModal({ open: false, post: null }); }

  function handleFormSubmit(values: PostFormValues) {
    const p = modal.post;
    const tags = values.tags ? values.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];

    const data: Record<string, unknown> = {
      title: values.title,
      slug: values.slug,
      excerpt: values.excerpt || null,
      featured_image: values.featured_image || null,
      body: values.body || null,
      category: values.category || null,
      tags,
      seo_title: values.seo_title || null,
      seo_description: values.seo_description || null,
      status: values.status,
      reading_time_min: values.reading_time_min ? parseInt(values.reading_time_min, 10) || null : null,
      scheduled_at: values.status === "scheduled" && values.scheduled_at ? new Date(values.scheduled_at).toISOString() : null,
      published_at:
        values.status === "published" && !p?.published_at
          ? new Date().toISOString()
          : p?.published_at ?? null,
    };

    startTransition(async () => {
      if (p?.id) await adminUpdate("blog_posts", p.id, data, "/admin/posts");
      else await adminCreate("blog_posts", data, "/admin/posts");
      close();
      load();
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this post? This action cannot be undone.")) return;
    startTransition(async () => { await adminDeleteRow("blog_posts", id, "/admin/posts"); load(); });
  }

  function handleQuickStatus(id: string, newStatus: PostStatus) {
    const data: Record<string, unknown> = { status: newStatus };
    if (newStatus === "published") data.published_at = new Date().toISOString();
    startTransition(async () => { await adminUpdate("blog_posts", id, data, "/admin/posts"); load(); });
  }

  // Filter
  const filtered = posts.filter((p) => {
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return p.title.toLowerCase().includes(q) || (p.category?.toLowerCase().includes(q) ?? false);
    }
    return true;
  });

  const counts = {
    all: posts.length,
    draft: posts.filter((p) => p.status === "draft").length,
    scheduled: posts.filter((p) => p.status === "scheduled").length,
    published: posts.filter((p) => p.status === "published").length,
    archived: posts.filter((p) => p.status === "archived").length,
  };

  return (
    <AdminShell
      title="Blog Posts"
      description={`${posts.length} total · ${counts.published} published · ${counts.draft} drafts`}
      actions={
        <button onClick={openNew} className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent/80">
          <Plus className="h-4 w-4" /> New Post
        </button>
      }
    >
      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filter posts..." className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div className="flex gap-1">
          {(["all", "draft", "scheduled", "published", "archived"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${statusFilter === s ? "bg-accent text-white" : "bg-muted text-muted-foreground hover:text-foreground"}`}
            >
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)} ({counts[s]})
            </button>
          ))}
        </div>
      </div>

      {/* Data table */}
      <div className="overflow-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left text-xs font-medium text-muted-foreground">
              <th className="w-10 px-4 py-3"><ImageIcon className="h-4 w-4 text-muted-foreground/50" /></th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const sc = STATUS_CONFIG[p.status] ?? STATUS_CONFIG.draft;
              const StatusIcon = sc.icon;
              return (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-2">
                    {p.featured_image ? (
                      <img src={p.featured_image} alt="" className="h-8 w-12 rounded object-cover" />
                    ) : (
                      <div className="flex h-8 w-12 items-center justify-center rounded bg-muted"><ImageIcon className="h-3 w-3 text-muted-foreground/30" /></div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{p.title}</p>
                    <p className="text-xs text-muted-foreground">/{p.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    {p.category ? <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{p.category}</span> : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${sc.cls}`}>
                      <StatusIcon className="h-3 w-3" />
                      {sc.label}
                    </span>
                    {p.status === "scheduled" && p.scheduled_at && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {new Date(p.scheduled_at).toLocaleDateString()}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(p.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      {p.status === "draft" && (
                        <button onClick={() => handleQuickStatus(p.id, "published")} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground" title="Publish">
                          <Eye className="h-4 w-4" />
                        </button>
                      )}
                      {p.status === "published" && (
                        <button onClick={() => handleQuickStatus(p.id, "draft")} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground" title="Unpublish">
                          <EyeOff className="h-4 w-4" />
                        </button>
                      )}
                      <button onClick={() => openEdit(p)} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => handleDelete(p.id)} className="rounded-md p-1.5 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">{search || statusFilter !== "all" ? "No posts match your filter." : "No posts yet."}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <FormModal title={modal.post?.id ? "Edit Post" : "New Post"} open={modal.open} onClose={close}>
        {modal.open && (
          <PostForm
            key={modal.post?.id ?? "new"}
            defaultValues={modal.post}
            onSubmit={handleFormSubmit}
            onCancel={close}
            isPending={pending}
          />
        )}
      </FormModal>
    </AdminShell>
  );
}
