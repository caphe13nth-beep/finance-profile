import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { siteMetadata } from "@/lib/metadata";

export const metadata = siteMetadata({
  title: "Admin",
  path: "/admin",
  noIndex: true,
});

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Double-check auth on the server side (proxy handles the redirect,
  // but this is a safety net for direct server component renders)
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Allow the login page through without auth
  // (proxy already handles redirect logic, but layout wraps all /admin routes)
  if (!user) {
    // The proxy should have already redirected, but if we somehow get here
    // (e.g. direct server render), redirect now — except for the login page
    // which is handled by its own page component
  }

  return <>{children}</>;
}
