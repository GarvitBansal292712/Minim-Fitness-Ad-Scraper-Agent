import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import Sidebar from "@/components/dashboard/Sidebar";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export default async function ProtectedLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  if (!hasSupabaseEnv()) {
    return (
      <div className="min-h-screen flex bg-transparent">
        <main className="flex-1 p-6">{children}</main>
      </div>
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="min-h-screen flex bg-transparent">
      <Sidebar userEmail={user.email ?? null} />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
