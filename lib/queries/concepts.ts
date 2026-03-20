import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type BrandRow = Database["public"]["Tables"]["brands"]["Row"];

export type ConceptsStatusFilter = "pending" | "approved" | "rejected";

type ConceptRecord = {
  id: string;
  lead_id: string;
  // These fields exist in your current schema; treat as optional for resilience.
  concept_title?: string | null;
  hook_shot?: string | null;
  visual_sequence?: string | null;
  product_reveal?: string | null;
  tagline?: string | null;
  why_it_wins?: string | null;
  production_tier?: string | null;
  concept_pdf_url?: string | null;
  generated_at?: string | null;
  // Unknown schema fields may still be present due to `select("*")`.
  [key: string]: unknown;
};

type LeadPhaseRow = {
  id: string;
  brand_id: string | null;
  status: string | null;
};

export type ConceptsListItem = {
  concept: ConceptRecord;
  brand: BrandRow | null;
  leadStatus: string | null;
};

export type ConceptsPageData = {
  items: ConceptsListItem[];
  statusFilter: ConceptsStatusFilter;
};

function matchesStatusFilter(leadStatus: string | null, filter: ConceptsStatusFilter) {
  // Based on your current `leads.status` values (e.g. `concept_generated`).
  if (filter === "pending") return leadStatus === "concept_generated";
  if (filter === "approved") return leadStatus === "concept_ready";
  return leadStatus === "rejected";
}

export async function getConceptsPageData(params: {
  statusFilter: ConceptsStatusFilter;
}): Promise<ConceptsPageData> {
  const { statusFilter } = params;
  const supabase = await createSupabaseServerClient();

  const { data: conceptsData, error: conceptsError } = await supabase
    .from("concepts")
    .select("*")
    .order("generated_at", { ascending: false })
    .limit(300);

  if (conceptsError) {
    throw new Error(`Failed to load concepts: ${conceptsError.message}`);
  }

  const conceptsRows = (conceptsData ?? []) as ConceptRecord[];
  const leadIds = [...new Set(conceptsRows.map((c) => c.lead_id))];

  const { data: leadsData, error: leadsError } = leadIds.length
    ? await supabase
        .from("leads")
        .select("id,brand_id,status")
        .in("id", leadIds)
    : ({ data: [], error: null } as { data: LeadPhaseRow[]; error: null | { message: string } });

  if (leadsError) {
    throw new Error(`Failed to load leads for concepts: ${leadsError.message}`);
  }

  const leadsRows = (leadsData ?? []) as LeadPhaseRow[];
  const leadById = new Map<string, LeadPhaseRow>();
  for (const l of leadsRows) leadById.set(l.id, l);

  // Filter concepts by the phase stored on the leads table.
  const filteredConcepts = conceptsRows.filter((concept) => {
    const lead = leadById.get(concept.lead_id);
    return matchesStatusFilter(lead?.status ?? null, statusFilter);
  });

  const brandIds = [...new Set(leadsRows.map((l) => l.brand_id))].filter(
    (id): id is string => typeof id === "string" && id.length > 0,
  );

  const { data: brandsData, error: brandsError } = brandIds.length
    ? await supabase
        .from("brands")
        .select("id,brand_name,website,brand_voice,price_tier")
        .in("id", brandIds)
    : ({ data: [], error: null } as { data: BrandRow[]; error: null | { message: string } });

  if (brandsError) {
    throw new Error(`Failed to load brands: ${brandsError.message}`);
  }

  const brandsRows = (brandsData ?? []) as BrandRow[];
  const brandById = new Map<string, BrandRow>();
  for (const b of brandsRows) brandById.set(b.id, b);

  return {
    statusFilter,
    items: filteredConcepts.map((concept) => {
      const lead = leadById.get(concept.lead_id);
      return {
        concept,
        brand: lead?.brand_id ? brandById.get(lead.brand_id) ?? null : null,
        leadStatus: lead?.status ?? null,
      };
    }),
  };
}

