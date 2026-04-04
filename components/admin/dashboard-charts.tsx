"use client";

import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

interface DailyCount { date: string; count: number; }
interface PostView { title: string; views: number; }

const tooltipStyle = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 12,
};

export function SubscribersChart({ data }: { data: DailyCount[] }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            axisLine={false} tickLine={false}
            tickFormatter={(v) => v.slice(5)}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            axisLine={false} tickLine={false}
            allowDecimals={false}
          />
          <Tooltip contentStyle={tooltipStyle} />
          <Line
            type="monotone" dataKey="count" name="Subscribers"
            stroke="var(--chart-1)" strokeWidth={2} dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TopPostsChart({ data }: { data: PostView[] }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            axisLine={false} tickLine={false}
            allowDecimals={false}
          />
          <YAxis
            type="category" dataKey="title"
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            axisLine={false} tickLine={false}
            width={120}
            tickFormatter={(v) => v.length > 18 ? v.slice(0, 18) + "…" : v}
          />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="views" name="Views" fill="var(--chart-2)" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
