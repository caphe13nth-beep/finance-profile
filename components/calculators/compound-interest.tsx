"use client";

import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const FREQUENCIES: Record<string, number> = {
  Annually: 1,
  "Semi-Annually": 2,
  Quarterly: 4,
  Monthly: 12,
  Daily: 365,
};

function fmt(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export function CompoundInterestCalculator() {
  const [principal, setPrincipal] = useState(10000);
  const [rate, setRate] = useState(7);
  const [years, setYears] = useState(20);
  const [frequency, setFrequency] = useState("Monthly");

  const data = useMemo(() => {
    const n = FREQUENCIES[frequency];
    const r = rate / 100;
    return Array.from({ length: years + 1 }, (_, t) => {
      const amount = principal * Math.pow(1 + r / n, n * t);
      const interest = amount - principal;
      return { year: t, total: Math.round(amount), interest: Math.round(interest), principal };
    });
  }, [principal, rate, years, frequency]);

  const final = data[data.length - 1];

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h3 className="font-heading text-xl font-bold">Compound Interest</h3>
      <p className="mt-1 text-sm text-muted-foreground">See how your money grows over time.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Initial Investment</label>
          <input type="number" value={principal} onChange={e => setPrincipal(+e.target.value)} min={0} className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Annual Rate (%)</label>
          <input type="number" value={rate} onChange={e => setRate(+e.target.value)} step={0.1} min={0} className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Years</label>
          <input type="number" value={years} onChange={e => setYears(+e.target.value)} min={1} max={50} className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Compounding</label>
          <select value={frequency} onChange={e => setFrequency(e.target.value)} className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            {Object.keys(FREQUENCIES).map(f => <option key={f}>{f}</option>)}
          </select>
        </div>
      </div>

      {/* Results */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-muted/50 p-3 text-center">
          <p className="font-mono text-lg font-bold text-foreground">{fmt(final.total)}</p>
          <p className="text-xs text-muted-foreground">Final Value</p>
        </div>
        <div className="rounded-lg bg-muted/50 p-3 text-center">
          <p className="font-mono text-lg font-bold text-accent">{fmt(final.interest)}</p>
          <p className="text-xs text-muted-foreground">Interest Earned</p>
        </div>
        <div className="rounded-lg bg-muted/50 p-3 text-center">
          <p className="font-mono text-lg font-bold text-chart-2">{((final.total / principal - 1) * 100).toFixed(1)}%</p>
          <p className="text-xs text-muted-foreground">Total Return</p>
        </div>
      </div>

      {/* Chart */}
      <div className="mt-6 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v) => fmt(Number(v))} contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
            <Line type="monotone" dataKey="total" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="principal" stroke="var(--chart-2)" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
