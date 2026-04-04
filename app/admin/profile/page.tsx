"use client";

import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { adminUpdate, adminCreate } from "@/app/actions/admin-crud";
import { AdminShell } from "@/components/admin/admin-shell";
import { CheckCircle2 } from "lucide-react";

interface Profile { id: string; name: string; title: string | null; bio: string | null; photo_url: string | null; contact_info: Record<string, unknown>; social_links: Record<string, unknown>; skills: string[]; certifications: unknown[]; resume_url: string | null; }

const inputCls = "mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring";
const labelCls = "text-xs font-medium text-muted-foreground";
const textareaCls = "mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<Partial<Profile>>({ name: "", title: "", bio: "", photo_url: "", skills: [], certifications: [], resume_url: "", contact_info: {}, social_links: {} });
  const [contactStr, setContactStr] = useState("{}");
  const [socialStr, setSocialStr] = useState("{}");
  const [certsStr, setCertsStr] = useState("[]");
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();

  async function load() {
    const { data } = await createClient().from("profiles").select("*").limit(1).single();
    if (data) {
      setProfile(data);
      setContactStr(JSON.stringify(data.contact_info ?? {}, null, 2));
      setSocialStr(JSON.stringify(data.social_links ?? {}, null, 2));
      setCertsStr(JSON.stringify(data.certifications ?? [], null, 2));
    }
  }
  useEffect(() => { load(); }, []);

  function setField(k: string, v: unknown) { setProfile((p) => ({ ...p, [k]: v })); }

  function save() {
    let contactInfo = {}; try { contactInfo = JSON.parse(contactStr); } catch { /* keep */ }
    let socialLinks = {}; try { socialLinks = JSON.parse(socialStr); } catch { /* keep */ }
    let certs: unknown[] = []; try { certs = JSON.parse(certsStr); } catch { /* keep */ }

    const data: Record<string, unknown> = {
      name: profile.name, title: profile.title || null, bio: profile.bio || null,
      photo_url: profile.photo_url || null, resume_url: profile.resume_url || null,
      skills: profile.skills?.filter(Boolean) ?? [], contact_info: contactInfo,
      social_links: socialLinks, certifications: certs,
    };

    start(async () => {
      if (profile.id) await adminUpdate("profiles", profile.id, data, "/admin/profile");
      else await adminCreate("profiles", data, "/admin/profile");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      load();
    });
  }

  return (
    <AdminShell title="Profile" description="Edit your profile information">
      <div className="max-w-2xl space-y-6 rounded-2xl border border-border bg-card p-6">
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelCls}>Name *</label><input value={profile.name ?? ""} onChange={(e) => setField("name", e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Title</label><input value={profile.title ?? ""} onChange={(e) => setField("title", e.target.value)} className={inputCls} /></div>
        </div>
        <div><label className={labelCls}>Bio</label><textarea value={profile.bio ?? ""} onChange={(e) => setField("bio", e.target.value)} rows={5} className={textareaCls} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelCls}>Photo URL</label><input value={profile.photo_url ?? ""} onChange={(e) => setField("photo_url", e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Resume URL</label><input value={profile.resume_url ?? ""} onChange={(e) => setField("resume_url", e.target.value)} className={inputCls} /></div>
        </div>
        <div><label className={labelCls}>Skills (one per line)</label><textarea value={(profile.skills ?? []).join("\n")} onChange={(e) => setField("skills", e.target.value.split("\n").filter(Boolean))} rows={4} className={textareaCls} /></div>
        <div><label className={labelCls}>Contact Info (JSON)</label><textarea value={contactStr} onChange={(e) => setContactStr(e.target.value)} rows={3} className={`${textareaCls} font-mono`} /></div>
        <div><label className={labelCls}>Social Links (JSON)</label><textarea value={socialStr} onChange={(e) => setSocialStr(e.target.value)} rows={3} className={`${textareaCls} font-mono`} /></div>
        <div><label className={labelCls}>Certifications (JSON array)</label><textarea value={certsStr} onChange={(e) => setCertsStr(e.target.value)} rows={4} className={`${textareaCls} font-mono`} /></div>

        <div className="flex items-center gap-3 pt-2">
          <button onClick={save} disabled={pending} className="rounded-lg bg-accent px-6 py-2 text-sm font-semibold text-white hover:bg-green-dark disabled:opacity-50">
            {pending ? "Saving..." : "Save Profile"}
          </button>
          {saved && <span className="flex items-center gap-1 text-sm text-accent"><CheckCircle2 className="h-4 w-4" /> Saved</span>}
        </div>
      </div>
    </AdminShell>
  );
}
