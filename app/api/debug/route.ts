import { NextResponse } from "next/server";

export async function GET() {
  const checks: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    node_env: process.env.NODE_ENV,
    has_supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    has_anon_key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    has_service_role_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    has_site_url: !!process.env.NEXT_PUBLIC_SITE_URL,
    supabase_url_value: process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 30) + "...",
  };

  // Test Supabase connection
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (url && key) {
      const supabase = createClient(url, key);
      const { data, error } = await supabase
        .from("site_settings")
        .select("key")
        .limit(1);
      checks.supabase_connection = error ? `ERROR: ${error.message}` : "OK";
      checks.supabase_data = data ? `${data.length} rows` : "null";
    } else {
      checks.supabase_connection = "SKIPPED — missing env vars";
    }
  } catch (e) {
    checks.supabase_connection = `EXCEPTION: ${e instanceof Error ? e.message : String(e)}`;
  }

  // Test settings fetch
  try {
    const { fetchAllSettings } = await import("@/lib/supabase/settings");
    const settings = await fetchAllSettings();
    checks.settings_fetch = "OK";
    checks.settings_site_name = settings.site_identity.site_name;
    checks.settings_mode = settings.site_identity.site_mode;
  } catch (e) {
    checks.settings_fetch = `EXCEPTION: ${e instanceof Error ? e.message : String(e)}`;
  }

  return NextResponse.json(checks, { status: 200 });
}
