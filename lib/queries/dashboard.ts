import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type ScanRun = Database["public"]["Tables"]["scan_runs"]["Row"];

export type DashboardData = {
  scanRuns: ScanRun[];
  totalLeads: number;
  conceptsPending: number;
  emailsSent: number;
  replies: number;
};

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = await createSupabaseServerClient();

  const {
    data: scanRuns,
    error: scanRunsError,
  } = await supabase
    .from("scan_runs")
    .select("id,status,run_date")
    .order("run_date", { ascending: false });

  if (scanRunsError) {
    throw new Error(`Failed to load scan runs: ${scanRunsError.message}`);
  }

  const scanRunsRows = (scanRuns ?? []) as ScanRun[];

  let totalLeads = 0;
  let conceptsPending = 0;
  let emailsSent = 0;
  let replies = 0;

  try {
    const { count, error } = await supabase
      .from("leads")
      .select("id", { count: "exact", head: true });
    if (!error) totalLeads = count ?? 0;
  } catch {
    // Leave as 0; dashboard should still render.
  }

  try {
    const { count, error } = await supabase
      .from("concepts")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending");
    if (!error) conceptsPending = count ?? 0;
  } catch {
    // Leave as 0; dashboard should still render.
  }

  try {
    const { count, error } = await supabase
      .from("outreach")
      .select("id", { count: "exact", head: true })
      .not("email_sent_at", "is", null);
    if (!error) emailsSent = count ?? 0;
  } catch {
    // Leave as 0; dashboard should still render.
  }

  try {
    const { count, error } = await supabase
      .from("outreach")
      .select("id", { count: "exact", head: true })
      .eq("reply_received", true);
    if (!error) replies = count ?? 0;
  } catch {
    // Leave as 0; dashboard should still render.
  }

  return {
    scanRuns: scanRunsRows,
    totalLeads,
    conceptsPending,
    emailsSent,
    replies,
  };
}

