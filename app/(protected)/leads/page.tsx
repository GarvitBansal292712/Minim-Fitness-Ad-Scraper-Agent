import LeadsTableClient from "@/components/leads/LeadsTableClient";
import SupabaseConfigNotice from "@/components/shared/SupabaseConfigNotice";
import {
  getLeadsPageData,
  type LeadsStatusFilter,
} from "@/lib/queries/leads";
import { hasSupabaseEnv } from "@/lib/supabase/config";

const pageSize = 10;

const validFilters: LeadsStatusFilter[] = [
  "all",
  "new",
  "processing",
  "concept_ready",
  "outreach_sent",
];

function normalizeStatusFilter(value: unknown): LeadsStatusFilter {
  if (typeof value !== "string") return "all";
  return validFilters.includes(value as LeadsStatusFilter)
    ? (value as LeadsStatusFilter)
    : "all";
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (!hasSupabaseEnv()) {
    return <SupabaseConfigNotice />;
  }

  const sp = searchParams ? await searchParams : {};

  const statusFilter = normalizeStatusFilter(sp.status);
  const rawPage = sp.page;
  const page =
    typeof rawPage === "string" ? Math.max(1, Number.parseInt(rawPage, 10) || 1) : 1;

  const data = await getLeadsPageData({
    statusFilter,
    page,
    pageSize,
  });

  return (
    <LeadsTableClient
      items={data.items}
      statusFilter={data.statusFilter}
      page={data.page}
      totalPages={data.totalPages}
    />
  );
}
