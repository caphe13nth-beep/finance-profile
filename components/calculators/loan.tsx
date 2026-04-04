"use client";

import { useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function fmt(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function fmtFull(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

interface AmortRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export function LoanCalculator() {
  const [amount, setAmount] = useState(300000);
  const [rate, setRate] = useState(6.5);
  const [termYears, setTermYears] = useState(30);
  const [showTable, setShowTable] = useState(false);

  const { monthly, totalInterest, totalPaid, schedule } = useMemo(() => {
    const monthlyRate = rate / 100 / 12;
    const n = termYears * 12;

    if (monthlyRate === 0) {
      const pmt = amount / n;
      const rows: AmortRow[] = Array.from({ length: n }, (_, i) => ({
        month: i + 1,
        payment: pmt,
        principal: pmt,
        interest: 0,
        balance: amount - pmt * (i + 1),
      }));
      return { monthly: pmt, totalInterest: 0, totalPaid: amount, schedule: rows };
    }

    const pmt = amount * (monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
    let balance = amount;
    const rows: AmortRow[] = [];

    for (let i = 1; i <= n; i++) {
      const interestPmt = balance * monthlyRate;
      const principalPmt = pmt - interestPmt;
      balance = Math.max(0, balance - principalPmt);
      rows.push({
        month: i,
        payment: pmt,
        principal: principalPmt,
        interest: interestPmt,
        balance,
      });
    }

    const totalPd = pmt * n;
    return { monthly: pmt, totalInterest: totalPd - amount, totalPaid: totalPd, schedule: rows };
  }, [amount, rate, termYears]);

  const pieData = [
    { name: "Principal", value: Math.round(amount) },
    { name: "Interest", value: Math.round(totalInterest) },
  ];

  const COLORS = ["var(--chart-1)", "var(--chart-2)"];

  // Show yearly summary for table
  const yearlyRows = schedule.filter((_, i) => (i + 1) % 12 === 0 || i === schedule.length - 1);

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h3 className="font-heading text-xl font-bold">Loan Calculator</h3>
      <p className="mt-1 text-sm text-muted-foreground">Calculate monthly payments and total interest.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Loan Amount</label>
          <input type="number" value={amount} onChange={e => setAmount(+e.target.value)} min={0} className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Interest Rate (%)</label>
          <input type="number" value={rate} onChange={e => setRate(+e.target.value)} step={0.1} min={0} className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Term (Years)</label>
          <input type="number" value={termYears} onChange={e => setTermYears(+e.target.value)} min={1} max={50} className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
      </div>

      {/* Results */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg bg-muted/50 p-3 text-center">
          <p className="font-mono text-lg font-bold text-foreground">{fmtFull(monthly)}</p>
          <p className="text-xs text-muted-foreground">Monthly Payment</p>
        </div>
        <div className="rounded-lg bg-muted/50 p-3 text-center">
          <p className="font-mono text-lg font-bold text-accent">{fmt(totalPaid)}</p>
          <p className="text-xs text-muted-foreground">Total Paid</p>
        </div>
        <div className="rounded-lg bg-muted/50 p-3 text-center">
          <p className="font-mono text-lg font-bold text-chart-2">{fmt(totalInterest)}</p>
          <p className="text-xs text-muted-foreground">Total Interest</p>
        </div>
      </div>

      {/* Pie chart */}
      <div className="mt-6 flex flex-col items-center">
        <div className="h-52 w-full max-w-xs">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => fmt(Number(v))} contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-6 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-accent" /> Principal
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-chart-2" /> Interest
          </span>
        </div>
      </div>

      {/* Amortization table toggle */}
      <div className="mt-6">
        <button
          onClick={() => setShowTable(!showTable)}
          className="text-sm font-medium text-accent hover:text-accent/80"
        >
          {showTable ? "Hide" : "Show"} Amortization Schedule
        </button>

        {showTable && (
          <div className="mt-4 max-h-64 overflow-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-left text-xs font-medium text-muted-foreground">
                  <th className="px-3 py-2">Year</th>
                  <th className="px-3 py-2 text-right">Principal</th>
                  <th className="px-3 py-2 text-right">Interest</th>
                  <th className="px-3 py-2 text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {yearlyRows.map((row) => (
                  <tr key={row.month} className="border-b border-border last:border-0">
                    <td className="px-3 py-2 font-mono">{Math.ceil(row.month / 12)}</td>
                    <td className="px-3 py-2 text-right font-mono text-accent">
                      {fmt(amount - row.balance)}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-chart-2">
                      {fmt(row.payment * row.month - (amount - row.balance))}
                    </td>
                    <td className="px-3 py-2 text-right font-mono">{fmt(row.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
