"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  getSupabaseConfigErrorMessage,
  hasSupabaseEnv,
} from "@/lib/supabase/config";
import { useRouter } from "next/navigation";
import { useState } from "react";

function SkeletonLine({ className }: { className: string }) {
  return <div className={["h-4 bg-black/5 rounded", "animate-pulse", className].join(" ")} />;
}

export default function LoginPage() {
  const router = useRouter();
  const isSupabaseConfigured = hasSupabaseEnv();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function onSignIn() {
    setErrorMessage(null);
    if (!email.trim() || !password) {
      setErrorMessage("Enter your email and password.");
      return;
    }

    setIsLoading(true);
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setIsLoading(false);
      setErrorMessage(getSupabaseConfigErrorMessage());
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setIsLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    const redirectedFrom = new URLSearchParams(window.location.search).get(
      "redirectedFrom",
    );
    router.push(redirectedFrom ? redirectedFrom : "/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-[520px] glass-card p-6 sm:p-8">
        <div className="flex flex-col gap-6">
          <div>
            <div className="text-[22px] font-semibold text-black/90">MINIM</div>
            <div className="mt-2 text-sm text-black/60">
              Sign in to approve concepts and track outreach.
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {isLoading ? (
              <>
                <SkeletonLine className="w-full" />
                <SkeletonLine className="w-4/5" />
                <SkeletonLine className="w-full" />
                <SkeletonLine className="w-1/2" />
              </>
            ) : (
              <>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-black/70">Email</label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="h-[44px] px-3 rounded-[10px] border border-white/75 bg-white/70 backdrop-blur-[12px] outline-none"
                    autoComplete="email"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-black/70">Password</label>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your password"
                    type="password"
                    className="h-[44px] px-3 rounded-[10px] border border-white/75 bg-white/70 backdrop-blur-[12px] outline-none"
                    autoComplete="current-password"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") onSignIn();
                    }}
                  />
                </div>

                {errorMessage ? (
                  <div className="text-sm text-black/70 bg-white/65 border border-white/75 rounded-[10px] px-3 py-2">
                    {errorMessage}
                  </div>
                ) : !isSupabaseConfigured ? (
                  <div className="text-sm text-black/70 bg-white/65 border border-white/75 rounded-[10px] px-3 py-2">
                    {getSupabaseConfigErrorMessage()}
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={onSignIn}
                  className="h-[44px] rounded-[10px] bg-gradient-to-r from-[#3B82F6] to-[#38BDF8] text-white font-medium shadow-[0_4px_14px_rgba(59,130,246,0.3)] hover:brightness-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={!email.trim() || !password || isLoading || !isSupabaseConfigured}
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
