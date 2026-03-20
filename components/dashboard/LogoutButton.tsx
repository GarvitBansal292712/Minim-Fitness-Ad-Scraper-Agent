"use client";

import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function onLogout() {
    if (isSigningOut) return;
    setIsSigningOut(true);

    const { error } = await supabase.auth.signOut();
    if (error) {
      // For now, fall back to a local refresh so the operator can re-auth.
      setIsSigningOut(false);
      router.refresh();
      return;
    }

    router.push("/login");
  }

  return (
    <button
      type="button"
      onClick={onLogout}
      disabled={isSigningOut}
      className={[
        "px-3 py-2 text-sm border rounded-[10px] bg-white/55 backdrop-blur-[12px] border-white/75",
        isSigningOut ? "opacity-60 cursor-not-allowed" : "hover:bg-white/70",
      ].join(" ")}
    >
      {isSigningOut ? "Signing out..." : "Log out"}
    </button>
  );
}

