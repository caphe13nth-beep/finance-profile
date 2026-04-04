"use client";

import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { updateSetting } from "@/app/actions/settings";
import { AdminShell } from "@/components/admin/admin-shell";
import { Plus, Trash2, ArrowUp, ArrowDown, CheckCircle2 } from "lucide-react";

const inputCls = "h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring";
const labelCls = "text-xs font-medium text-muted-foreground";

const ICON_OPTIONS = [
  { value: "clock", label: "Clock" },
  { value: "trending-up", label: "Trending Up" },
  { value: "users", label: "Users" },
  { value: "file-text", label: "File Text" },
  { value: "bar-chart", label: "Bar Chart" },
  { value: "dollar-sign", label: "Dollar Sign" },
  { value: "target", label: "Target" },
  { value: "pie-chart", label: "Pie Chart" },
  { value: "briefcase", label: "Briefcase" },
  { value: "zap", label: "Zap" },
];

interface StatItem {
  label: string;
  value: number;
  suffix: string;
  prefix: string;
  icon: string;
}

const EMPTY_STAT: StatItem = { label: "", value: 0, suffix: "", prefix: "", icon: "trending-up" };

export default function AdminStatsPage() {
  const [stats, setStats] = useState<StatItem[]>([]);
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);

  async function load() {
    const { data: row } = await createClient()
      .from("site_settings")
      .select("value")
      .eq("key", "stats_bar")
      .single();
    if (row) {
      const val = row.value as { stats?: StatItem[] };
      setStats(val.stats ?? []);
    }
  }

  useEffect(() => { load(); }, []);

  function updateStat(index: number, field: keyof StatItem, value: string | number) {
    setStats((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  function addStat() {
    setStats((prev) => [...prev, { ...EMPTY_STAT }]);
  }

  function removeStat(index: number) {
    setStats((prev) => prev.filter((_, i) => i !== index));
  }

  function moveStat(index: number, dir: -1 | 1) {
    const next = index + dir;
    if (next < 0 || next >= stats.length) return;
    setStats((prev) => {
      const arr = [...prev];
      [arr[index], arr[next]] = [arr[next], arr[index]];
      return arr;
    });
  }

  function save() {
    start(async () => {
      await updateSetting("stats_bar", { stats });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  }

  return (
    <AdminShell
      title="Stats Bar"
      description="Edit KPI cards shown on the homepage"
      actions={
        <div className="flex items-center gap-2">
          {saved && <span className="flex items-center gap-1 text-sm text-accent"><CheckCircle2 className="h-4 w-4" /> Saved</span>}
          <button
            onClick={addStat}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted"
          >
            <Plus className="h-4 w-4" /> Add Stat
          </button>
          <button
            onClick={save}
            disabled={pending}
            className="rounded-lg bg-accent px-4 py-1.5 text-sm font-semibold text-white hover:bg-green-dark disabled:opacity-50"
          >
            {pending ? "Saving..." : "Save All"}
          </button>
        </div>
      }
    >
      <div className="max-w-3xl space-y-3">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-card p-4"
          >
            <div className="flex items-start gap-3">
              {/* Reorder */}
              <div className="flex flex-col gap-0.5 pt-5">
                <button
                  onClick={() => moveStat(i, -1)}
                  disabled={i === 0}
                  className="rounded p-1 text-muted-foreground hover:text-foreground disabled:opacity-20"
                  aria-label="Move up"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => moveStat(i, 1)}
                  disabled={i === stats.length - 1}
                  className="rounded p-1 text-muted-foreground hover:text-foreground disabled:opacity-20"
                  aria-label="Move down"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Fields */}
              <div className="flex-1 grid grid-cols-6 gap-3">
                <div className="col-span-2">
                  <label className={labelCls}>Label</label>
                  <input
                    value={stat.label}
                    onChange={(e) => updateStat(i, "label", e.target.value)}
                    className={inputCls}
                    placeholder="Years Experience"
                  />
                </div>
                <div>
                  <label className={labelCls}>Value</label>
                  <input
                    type="number"
                    value={stat.value}
                    onChange={(e) => updateStat(i, "value", +e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Prefix</label>
                  <input
                    value={stat.prefix}
                    onChange={(e) => updateStat(i, "prefix", e.target.value)}
                    className={inputCls}
                    placeholder="$"
                  />
                </div>
                <div>
                  <label className={labelCls}>Suffix</label>
                  <input
                    value={stat.suffix}
                    onChange={(e) => updateStat(i, "suffix", e.target.value)}
                    className={inputCls}
                    placeholder="+, %, M+"
                  />
                </div>
                <div>
                  <label className={labelCls}>Icon</label>
                  <select
                    value={stat.icon}
                    onChange={(e) => updateStat(i, "icon", e.target.value)}
                    className={inputCls}
                  >
                    {ICON_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Delete */}
              <button
                onClick={() => removeStat(i)}
                className="mt-5 rounded p-1.5 text-destructive hover:bg-destructive/10"
                aria-label="Remove stat"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}

        {stats.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-12 text-center">
            <p className="text-sm text-muted-foreground">No stats configured.</p>
            <button
              onClick={addStat}
              className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-green-dark"
            >
              <Plus className="h-4 w-4" /> Add First Stat
            </button>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
