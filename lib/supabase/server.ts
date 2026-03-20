import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";
import {
  getSupabaseConfigErrorMessage,
  getSupabasePublicEnv,
} from "@/lib/supabase/config";

export async function createSupabaseServerClient() {
  const env = getSupabasePublicEnv();
  if (!env) {
    throw new Error(getSupabaseConfigErrorMessage());
  }

  // Adapter to let Supabase read/write auth cookies in Next.js.
  const cookieStore = await cookies();

  return createServerClient<Database>(env.url, env.anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: { httpOnly?: boolean; path?: string } = {}) {
        cookieStore.set({ name, value, ...options });
      },
      remove(name: string, options: { httpOnly?: boolean; path?: string } = {}) {
        cookieStore.set({ name, value: "", ...options });
      },
    },
  });
}
