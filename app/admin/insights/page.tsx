"use client";

import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { adminCreate, adminUpdate } from "@/app/actions/admin-crud";
import { AdminShell } from "@/components/admin/admin-shell";
import { FormModal } from "@/components/admin/form-modal";
import { Plus, Pencil } from "lucide-react";

interface Insight { id: string; asset_name: string; sector: string | null; thesis_summary: string | null; risks: string | null; target_price: number | null; time_horizon: string | null; charts: unknown; published_at: string | null; }
const EMPTY: Partial<Insight> = { asset_name: "", sector: "", thesis_summary: "", risks: "", target_price: null, time_horizon: "", charts: [] };
const inputCls = "mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring";
const labelCls = "text-xs font-medium text-muted-foreground";
const textareaCls = "mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

export default function AdminInsightsPage() {
  const [items, setItems] = useState<Insight[]>([]);
  const [modal, setModal] = useState<{ open: boolean; item: Partial<Insight> | null }>({ open: false, item: null });
  const [chartsStr, setChartsStr] = useState("[]");
  const [pending, start] = useTransition();

  async function load() { const { data } = await createClient().from("market_insights").select("*").order("published_at", { ascending: false }); setItems(data ?? []); }
  useEffect(() => { load(); }, []);

  function setField(k: string, v: unknown) { setModal((m) => ({ ...m, item: { ...m.item!, [k]: v } })); }
  function close() { setModal({ open: false, item: null }); }

  function save() {
    const i = modal.item; if (!i?.asset_name) return;
    let charts: unknown = [];
    try { charts = JSON.parse(chartsStr); } catch { /* keep empty */ }
    const data: Record<string, unknown> = {
      asset_name: i.asset_name, sector: i.sector || null, thesis_summary: i.thesis_summary || null,
      risks: i.risks || null, target_price: i.target_price ?? null, time_horizon: i.time_horizon || null,
      charts, published_at: i.published_at || new Date().toISOString(),
    };
    start(async () => {
      if (i.id) await adminUpdate("market_insights", i.id, data, "/admin/insights");
      else await adminCreate("market_insights", data, "/admin/insights");
      close(); load();
    });
  }

  return (
    <AdminShell title="Market Insights" description={`${items.length} insights`}
      actions={<button onClick={() => { setChartsStr("[]"); setModal({ open: true, item: { ...EMPTY } }); }} className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-green-dark"><Plus className="h-4 w-4" /> New</button>}>
      <div className="overflow-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-muted/50 text-left text-xs font-medium text-muted-foreground">
            <th className="px-4 py-3">Asset</th><th className="px-4 py-3">Sector</th><th className="px-4 py-3">Target</th><th className="px-4 py-3">Horizon</th><th className="px-4 py-3 text-right">Actions</th>
          </tr></thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium">{i.asset_name}</td>
                <td className="px-4 py-3 text-muted-foreground">{i.sector ?? "—"}</td>
                <td className="px-4 py-3 font-mono text-muted-foreground">{i.target_price != null ? `$${i.target_price}` : "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{i.time_horizon ?? "—"}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => { setChartsStr(JSON.stringify(i.charts ?? [], null, 2)); setModal({ open: true, item: { ...i } }); }} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"><Pencil className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No insights.</td></tr>}
          </tbody>
        </table>
      </div>
      <FormModal title={modal.item?.id ? "Edit Insight" : "New Insight"} open={modal.open} onClose={close}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelCls}>Asset Name *</label><input value={modal.item?.asset_name ?? ""} onChange={(e) => setField("asset_name", e.target.value)} className={inputCls} /></div>
            <div><label className={labelCls}>Sector</label><input value={modal.item?.sector ?? ""} onChange={(e) => setField("sector", e.target.value)} className={inputCls} /></div>
          </div>
          <div><label className={labelCls}>Thesis Summary</label><textarea value={modal.item?.thesis_summary ?? ""} onChange={(e) => setField("thesis_summary", e.target.value)} rows={4} className={textareaCls} /></div>
          <div><label className={labelCls}>Risks</label><textarea value={modal.item?.risks ?? ""} onChange={(e) => setField("risks", e.target.value)} rows={3} className={textareaCls} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelCls}>Target Price</label><input type="number" value={modal.item?.target_price ?? ""} onChange={(e) => setField("target_price", e.target.value ? +e.target.value : null)} className={inputCls} /></div>
            <div><label className={labelCls}>Time Horizon</label><input value={modal.item?.time_horizon ?? ""} onChange={(e) => setField("time_horizon", e.target.value)} className={inputCls} placeholder="6-12 months" /></div>
          </div>
          <div><label className={labelCls}>Charts (JSON)</label><textarea value={chartsStr} onChange={(e) => setChartsStr(e.target.value)} rows={4} className={`${textareaCls} font-mono`} /></div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={close} className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
            <button onClick={save} disabled={pending} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-green-dark disabled:opacity-50">{pending ? "Saving..." : "Save"}</button>
          </div>
        </div>
      </FormModal>
    </AdminShell>
  );
}
