"use client";

import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

function fmt(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export function RoiCalculator() {
  const [initial, setInitial] = useState(50000);
  const [final, setFinal] = useState(72000);
  const [years, setYears] = useState(3);

  const { roi, annualized, profit } = useMemo(() => {
    const p = final - initial;
    const r = initial > 0 ? (p / initial) * 100 : 0;
    const a = initial > 0 && years > 0
      ? (Math.pow(final / initial, 1 / years) - 1) * 100
      : 0;
    return { roi: r, annualized: a, profit: p };
  }, [initial, final, years]);

  const barData = [
    { label: "Initial", value: initial },
    { label: "Final", value: final },
    { label: "Profit", value: Math.max(0, profit) },
  ];

  const COLORS = ["var(--chart-4)", "var(--chart-1)", "var(--chart-2)"];

  const isPositive = profit >= 0;

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h3 className="font-heading text-xl font-bold">ROI Calculator</h3>
      <p className="mt-1 text-sm text-muted-foreground">Measure your return on investment.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Initial Investment</label>
          <input type="number" value={initial} onChange={e => setInitial(+e.target.value)} min={0} className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Final Value</label>
          <input type="number" value={final} onChange={e => setFinal(+e.target.value)} min={0} className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Time Period (Years)</label>
          <input type="number" value={years} onChange={e => setYears(+e.target.value)} min={1} max={50} className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
      </div>

      {/* Hero ROI display */}
      <div className="mt-6 flex flex-col items-center rounded-xl bg-muted/50 py-6">
        <p className="text-sm font-medium text-muted-foreground">Total ROI</p>
        <p className={`font-mono text-5xl font-bold ${isPositive ? "text-accent" : "text-destructive"}`}>
          {isPositive ? "+" : ""}{roi.toFixed(1)}%
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Annualized: <span className="font-mono font-semibold text-foreground">{annualized.toFixed(2)}%</span>
        </p>
      </div>

      {/* Results */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-muted/50 p-3 text-center">
          <p className="font-mono text-lg font-bold text-foreground">{fmt(initial)}</p>
          <p className="text-xs text-muted-foreground">Invested</p>
        </div>
        <div className="rounded-lg bg-muted/50 p-3 text-center">
          <p className="font-mono text-lg font-bold text-foreground">{fmt(final)}</p>
          <p className="text-xs text-muted-foreground">Final Value</p>
        </div>
        <div className="rounded-lg bg-muted/50 p-3 text-center">
          <p className={`font-mono text-lg font-bold ${isPositive ? "text-accent" : "text-destructive"}`}>{fmt(profit)}</p>
          <p className="text-xs text-muted-foreground">Net Profit</p>
        </div>
      </div>

      {/* Bar chart comparison */}
      <div className="mt-6 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={barData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v) => fmt(Number(v))} contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {barData.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
