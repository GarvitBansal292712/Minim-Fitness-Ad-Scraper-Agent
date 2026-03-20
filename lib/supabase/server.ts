import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

export async function createSupabaseServerClient() {
  // Adapter to let Supabase read/write auth cookies in Next.js.
  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl!, supabaseAnonKey!, {
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

