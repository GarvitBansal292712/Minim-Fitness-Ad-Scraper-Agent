import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type LeadRow = Database["public"]["Tables"]["leads"]["Row"];
type BrandRow = Database["public"]["Tables"]["brands"]["Row"];
type AdAssetRow = Database["public"]["Tables"]["ad_assets"]["Row"];

export type LeadsStatusFilter = "all" | "new" | "processing" | "concept_ready" | "outreach_sent";

export type LeadsListItem = {
  lead: LeadRow;
  brand: BrandRow | null;
  thumbnails: AdAssetRow[];
};

export type LeadsPageData = {
  items: LeadsListItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  statusFilter: LeadsStatusFilter;
};

export async function getLeadsPageData(params: {
  statusFilter: LeadsStatusFilter;
  page: number;
  pageSize: number;
}): Promise<LeadsPageData> {
  const { statusFilter, page, pageSize } = params;
  const supabase = await createSupabaseServerClient();

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const leadsBase = supabase
    .from("leads")
    .select(
      "id,brand_id,scan_run_id,status,assets_ingested,active_ad_count,ad_runtime_days,platforms",
    )
    .order("id", { ascending: false });

  const leadsCountBase = supabase
    .from("leads")
    .select("id", { count: "exact", head: true });

  const leadsQuery =
    statusFilter === "all" ? leadsBase : leadsBase.eq("status", statusFilter);
  const leadsCountQuery =
    statusFilter === "all"
      ? leadsCountBase
      : leadsCountBase.eq("status", statusFilter);

  const [
    { data: leadsData, error: leadsError },
    { count, error: countError },
  ] = await Promise.all([
    leadsQuery.range(from, to),
    leadsCountQuery,
  ]);

  if (leadsError) {
    throw new Error(`Failed to load leads: ${leadsError.message}`);
  }

  if (countError) {
    throw new Error(`Failed to count leads: ${countError.message}`);
  }

  const leadsRows = (leadsData ?? []) as LeadRow[];
  const totalCount = count ?? 0;

  const brandIds = [...new Set(leadsRows.map((l) => l.brand_id))];
  const leadIds = leadsRows.map((l) => l.id);

  let brandsRows: BrandRow[] = [];
  if (brandIds.length > 0) {
    const { data, error } = await supabase
      .from("brands")
      .select("id,brand_name,website,brand_voice,price_tier")
      .in("id", brandIds);

    if (error) {
      throw new Error(`Failed to load brands: ${error.message}`);
    }

    brandsRows = (data ?? []) as BrandRow[];
  }

  let assetsRows: AdAssetRow[] = [];
  if (leadIds.length > 0) {
    const { data, error } = await supabase
      .from("ad_assets")
      .select("id,lead_id,brand_id,stored_url,asset_type,ingested_at")
      .eq("asset_type", "thumbnail")
      .in("lead_id", leadIds)
      .order("ingested_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to load ad assets: ${error.message}`);
    }

    assetsRows = (data ?? []) as AdAssetRow[];
  }

  const brandById = new Map<string, BrandRow>();
  for (const b of brandsRows) brandById.set(b.id, b);

  const assetsByLeadId = new Map<string, AdAssetRow[]>();
  for (const a of assetsRows) {
    const list = assetsByLeadId.get(a.lead_id) ?? [];
    list.push(a);
    assetsByLeadId.set(a.lead_id, list);
  }

  const items: LeadsListItem[] = leadsRows.map((lead) => ({
    lead,
    brand: brandById.get(lead.brand_id) ?? null,
    thumbnails: (assetsByLeadId.get(lead.id) ?? []).slice(0, 8),
  }));

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return {
    items,
    page,
    pageSize,
    totalCount,
    totalPages,
    statusFilter,
  };
}

