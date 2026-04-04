"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AdminShell } from "@/components/admin/admin-shell";
import { Download } from "lucide-react";

interface Subscriber { id: string; email: string; subscribed_at: string; is_active: boolean; }

export default function AdminSubscribersPage() {
  const [items, setItems] = useState<Subscriber[]>([]);

  async function load() { const { data } = await createClient().from("newsletter_subscribers").select("*").order("subscribed_at", { ascending: false }); setItems(data ?? []); }
  useEffect(() => { load(); }, []);

  function exportCsv() {
    const header = "email,subscribed_at,is_active";
    const rows = items.map((s) => `${s.email},${s.subscribed_at},${s.is_active}`);
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const active = items.filter((s) => s.is_active).length;

  return (
    <AdminShell title="Newsletter Subscribers" description={`${items.length} total · ${active} active`}
      actions={
        <button onClick={exportCsv} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      }>
      <div className="overflow-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-muted/50 text-left text-xs font-medium text-muted-foreground">
            <th className="px-4 py-3">Email</th><th className="px-4 py-3">Subscribed</th><th className="px-4 py-3">Status</th>
          </tr></thead>
          <tbody>
            {items.map((s) => (
              <tr key={s.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium">{s.email}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(s.subscribed_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${s.is_active ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}>
                    {s.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">No subscribers.</td></tr>}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
