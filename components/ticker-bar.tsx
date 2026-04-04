"use client";

import { TrendingUp, TrendingDown } from "lucide-react";

const TICKER_ITEMS = [
  { symbol: "S&P 500", value: "5,248.32", change: "+0.87%", up: true },
  { symbol: "NASDAQ", value: "16,384.47", change: "+1.12%", up: true },
  { symbol: "DOW", value: "39,127.14", change: "-0.23%", up: false },
  { symbol: "BTC", value: "68,412.00", change: "+2.34%", up: true },
  { symbol: "EUR/USD", value: "1.0847", change: "-0.15%", up: false },
  { symbol: "GOLD", value: "2,341.50", change: "+0.42%", up: true },
  { symbol: "10Y UST", value: "4.28%", change: "+0.03%", up: true },
  { symbol: "OIL WTI", value: "78.64", change: "-1.05%", up: false },
];

function TickerItem({ symbol, value, change, up }: (typeof TICKER_ITEMS)[0]) {
  return (
    <span className="inline-flex items-center gap-1.5 px-4 whitespace-nowrap">
      <span className="font-semibold text-foreground/90">{symbol}</span>
      <span className="font-mono text-xs">{value}</span>
      {up ? (
        <TrendingUp className="h-3 w-3 text-green" />
      ) : (
        <TrendingDown className="h-3 w-3 text-destructive" />
      )}
      <span className={`font-mono text-xs ${up ? "text-green" : "text-destructive"}`}>
        {change}
      </span>
    </span>
  );
}

export function TickerBar() {
  return (
    <div className="relative overflow-hidden border-b border-border bg-muted/50 py-1.5 text-xs">
      <div className="flex animate-[ticker_30s_linear_infinite] w-max">
        {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
          <TickerItem key={`${item.symbol}-${i}`} {...item} />
        ))}
      </div>
    </div>
  );
}
