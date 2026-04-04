"use client";

import { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

function fmt(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export function RetirementCalculator() {
  const [currentAge, setCurrentAge] = useState(30);
  const [retirementAge, setRetirementAge] = useState(65);
  const [currentSavings, setCurrentSavings] = useState(50000);
  const [monthlyContrib, setMonthlyContrib] = useState(1000);
  const [returnRate, setReturnRate] = useState(7);

  const data = useMemo(() => {
    const years = Math.max(0, retirementAge - currentAge);
    const monthlyRate = returnRate / 100 / 12;
    const points = [];
    let balance = currentSavings;
    let totalContrib = currentSavings;

    for (let y = 0; y <= years; y++) {
      points.push({
        age: currentAge + y,
        balance: Math.round(balance),
        contributions: Math.round(totalContrib),
      });
      for (let m = 0; m < 12; m++) {
        balance = balance * (1 + monthlyRate) + monthlyContrib;
        totalContrib += monthlyContrib;
      }
    }
    return points;
  }, [currentAge, retirementAge, currentSavings, monthlyContrib, returnRate]);

  const final = data[data.length - 1];
  const growth = final ? final.balance - final.contributions : 0;

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h3 className="font-heading text-xl font-bold">Retirement Planner</h3>
      <p className="mt-1 text-sm text-muted-foreground">Project your retirement savings growth.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Current Age</label>
          <input type="number" value={currentAge} onChange={e => setCurrentAge(+e.target.value)} min={18} max={80} className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Retirement Age</label>
          <input type="number" value={retirementAge} onChange={e => setRetirementAge(+e.target.value)} min={currentAge + 1} max={100} className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Current Savings</label>
          <input type="number" value={currentSavings} onChange={e => setCurrentSavings(+e.target.value)} min={0} className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Monthly Contribution</label>
          <input type="number" value={monthlyContrib} onChange={e => setMonthlyContrib(+e.target.value)} min={0} className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Expected Return (%)</label>
          <input type="number" value={returnRate} onChange={e => setReturnRate(+e.target.value)} step={0.1} min={0} className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
      </div>

      {/* Results */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-muted/50 p-3 text-center">
          <p className="font-mono text-lg font-bold text-foreground">{final ? fmt(final.balance) : "$0"}</p>
          <p className="text-xs text-muted-foreground">At Retirement</p>
        </div>
        <div className="rounded-lg bg-muted/50 p-3 text-center">
          <p className="font-mono text-lg font-bold text-accent">{fmt(growth)}</p>
          <p className="text-xs text-muted-foreground">Investment Growth</p>
        </div>
        <div className="rounded-lg bg-muted/50 p-3 text-center">
          <p className="font-mono text-lg font-bold text-gold">{final ? fmt(final.contributions) : "$0"}</p>
          <p className="text-xs text-muted-foreground">Total Contributed</p>
        </div>
      </div>

      {/* Chart */}
      <div className="mt-6 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <defs>
              <linearGradient id="retBalance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="retContrib" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.2} />
                <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="age" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v) => fmt(Number(v))} contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
            <Area type="monotone" dataKey="balance" stroke="var(--chart-1)" strokeWidth={2} fill="url(#retBalance)" />
            <Area type="monotone" dataKey="contributions" stroke="var(--chart-2)" strokeWidth={1.5} fill="url(#retContrib)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
