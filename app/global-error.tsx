"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", background: "#0F172A", color: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", margin: 0, padding: "2rem", textAlign: "center" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 700 }}>Something went wrong</h1>
          <p style={{ marginTop: "0.5rem", color: "#94A3B8" }}>
            The application encountered an unexpected error.
          </p>
          <button
            onClick={reset}
            style={{ marginTop: "1.5rem", padding: "0.625rem 1.5rem", background: "#10B981", color: "#fff", border: "none", borderRadius: "0.5rem", cursor: "pointer", fontWeight: 600, fontSize: "0.875rem" }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
