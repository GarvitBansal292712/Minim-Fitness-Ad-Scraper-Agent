"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import {
  getSupabaseConfigErrorMessage,
  getSupabasePublicEnv,
} from "@/lib/supabase/config";

type SupabaseBrowserClient = ReturnType<typeof createBrowserClient<Database>>;

let browserClient: SupabaseBrowserClient | null = null;

export function getSupabaseBrowserClient() {
  const env = getSupabasePublicEnv();
  if (!env) {
    return null;
  }

  if (!browserClient) {
    browserClient = createBrowserClient<Database>(env.url, env.anonKey);
  }

  return browserClient;
}

export function requireSupabaseBrowserClient() {
  const client = getSupabaseBrowserClient();

  if (!client) {
    throw new Error(getSupabaseConfigErrorMessage());
  }

  return client;
}
