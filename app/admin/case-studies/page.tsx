"use client";

import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { adminCreate, adminUpdate, adminDeleteRow } from "@/app/actions/admin-crud";
import { AdminShell } from "@/components/admin/admin-shell";
import { FormModal } from "@/components/admin/form-modal";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface CaseStudy {
  id: string;
  title: string;
  client_name: string | null;
  industry: string | null;
  challenge: string | null;
  strategy: string | null;
  result: string | null;
  kpi_metrics: Record<string, unknown> | null;
  images: string[] | null;
  pdf_url: string | null;
  created_at: string;
}

const EMPTY: Partial<CaseStudy> = { title: "", client_name: "", industry: "", challenge: "", strategy: "", result: "", kpi_metrics: {}, images: [], pdf_url: "" };
const inputCls = "mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring";
const labelCls = "text-xs font-medium text-muted-foreground";
const textareaCls = "mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

export default function AdminCaseStudiesPage() {
  const [items, setItems] = useState<CaseStudy[]>([]);
  const [modal, setModal] = useState<{ open: boolean; item: Partial<CaseStudy> | null }>({ open: false, item: null });
  const [kpiStr, setKpiStr] = useState("{}");
  const [pending, start] = useTransition();

  async function load() {
    const { data } = await createClient().from("case_studies").select("*").order("created_at", { ascending: false });
    setItems(data ?? []);
  }
  useEffect(() => { load(); }, []);

  function openNew() { setKpiStr("{}"); setModal({ open: true, item: { ...EMPTY } }); }
  function openEdit(cs: CaseStudy) { setKpiStr(JSON.stringify(cs.kpi_metrics ?? {}, null, 2)); setModal({ open: true, item: { ...cs } }); }
  function close() { setModal({ open: false, item: null }); }
  function setField(k: string, v: unknown) { setModal((m) => ({ ...m, item: { ...m.item!, [k]: v } })); }

  function save() {
    const c = modal.item;
    if (!c?.title) return;
    let metrics = {};
    try { metrics = JSON.parse(kpiStr); } catch { /* keep empty */ }
    const data: Record<string, unknown> = {
      title: c.title, client_name: c.client_name || null, industry: c.industry || null,
      challenge: c.challenge || null, strategy: c.strategy || null, result: c.result || null,
      kpi_metrics: metrics, images: c.images?.filter(Boolean) ?? [], pdf_url: c.pdf_url || null,
    };
    start(async () => {
      if (c.id) await adminUpdate("case_studies", c.id, data, "/admin/case-studies");
      else await adminCreate("case_studies", data, "/admin/case-studies");
      close(); load();
    });
  }

  function del(id: string) {
    if (!confirm("Delete?")) return;
    start(async () => { await adminDeleteRow("case_studies", id, "/admin/case-studies"); load(); });
  }

  return (
    <AdminShell title="Case Studies" description={`${items.length} studies`}
      actions={<button onClick={openNew} className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-green-dark"><Plus className="h-4 w-4" /> New</button>}>
      <div className="overflow-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-muted/50 text-left text-xs font-medium text-muted-foreground">
            <th className="px-4 py-3">Title</th><th className="px-4 py-3">Client</th><th className="px-4 py-3">Industry</th><th className="px-4 py-3 text-right">Actions</th>
          </tr></thead>
          <tbody>
            {items.map((cs) => (
              <tr key={cs.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium">{cs.title}</td>
                <td className="px-4 py-3 text-muted-foreground">{cs.client_name ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{cs.industry ?? "—"}</td>
                <td className="px-4 py-3"><div className="flex justify-end gap-1">
                  <button onClick={() => openEdit(cs)} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => del(cs.id)} className="rounded-md p-1.5 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
                </div></td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No case studies.</td></tr>}
          </tbody>
        </table>
      </div>
      <FormModal title={modal.item?.id ? "Edit Case Study" : "New Case Study"} open={modal.open} onClose={close}>
        <div className="space-y-4">
          <div><label className={labelCls}>Title *</label><input value={modal.item?.title ?? ""} onChange={(e) => setField("title", e.target.value)} className={inputCls} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelCls}>Client Name</label><input value={modal.item?.client_name ?? ""} onChange={(e) => setField("client_name", e.target.value)} className={inputCls} /></div>
            <div><label className={labelCls}>Industry</label><input value={modal.item?.industry ?? ""} onChange={(e) => setField("industry", e.target.value)} className={inputCls} /></div>
          </div>
          <div><label className={labelCls}>Challenge</label><textarea value={modal.item?.challenge ?? ""} onChange={(e) => setField("challenge", e.target.value)} rows={3} className={textareaCls} /></div>
          <div><label className={labelCls}>Strategy</label><textarea value={modal.item?.strategy ?? ""} onChange={(e) => setField("strategy", e.target.value)} rows={3} className={textareaCls} /></div>
          <div><label className={labelCls}>Result</label><textarea value={modal.item?.result ?? ""} onChange={(e) => setField("result", e.target.value)} rows={3} className={textareaCls} /></div>
          <div><label className={labelCls}>KPI Metrics (JSON)</label><textarea value={kpiStr} onChange={(e) => setKpiStr(e.target.value)} rows={3} className={`${textareaCls} font-mono`} /></div>
          <div><label className={labelCls}>Images (one URL per line)</label><textarea value={(modal.item?.images ?? []).join("\n")} onChange={(e) => setField("images", e.target.value.split("\n").filter(Boolean))} rows={2} className={textareaCls} /></div>
          <div><label className={labelCls}>PDF URL</label><input value={modal.item?.pdf_url ?? ""} onChange={(e) => setField("pdf_url", e.target.value)} className={inputCls} /></div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={close} className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
            <button onClick={save} disabled={pending} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-green-dark disabled:opacity-50">{pending ? "Saving..." : "Save"}</button>
          </div>
        </div>
      </FormModal>
    </AdminShell>
  );
}
