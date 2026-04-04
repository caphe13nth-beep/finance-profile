// Minimal static page — no data fetching, no settings, no Supabase
// If THIS page 404s, the issue is Vercel config, not our code

export default function HealthPage() {
  return (
    <div style={{ padding: "2rem", fontFamily: "system-ui" }}>
      <h1>Health Check OK</h1>
      <p>If you see this, Next.js routing works.</p>
      <p>Time: {new Date().toISOString()}</p>
      <ul>
        <li>
          <a href="/api/debug">/api/debug</a> — Check env vars and Supabase connection
        </li>
        <li>
          <a href="/">/ (homepage)</a> — Main page
        </li>
      </ul>
    </div>
  );
}
