import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type BrandRow = Database["public"]["Tables"]["brands"]["Row"];

type OutreachRow = {
  id: string;
  lead_id: string;
  contact_email: string | null;
  sent_at: string | null;
  replied: boolean | null;
  replied_at: string | null;
  sequence_id: string | null;
  step_reached: number | null;
  reply_sentiment: string | null;
  created_at: string;
};

type LeadRow = {
  id: string;
  brand_id: string | null;
};

export type OutreachListItem = {
  outreach: OutreachRow;
  brand: BrandRow | null;
  contactEmail: string | null;
  campaignStatus: string;
  replyReceived: boolean | null;
};

export type OutreachPageData = {
  items: OutreachListItem[];
  totalSent: number;
  replies: number;
  bookedCalls: number;
};

export async function getOutreachPageData(): Promise<OutreachPageData> {
  const supabase = await createSupabaseServerClient();

  const { data: outreachData, error: outreachError } = await supabase
    .from("outreach")
    .select(
      "id,lead_id,contact_email,sent_at,replied,replied_at,sequence_id,step_reached,reply_sentiment,created_at",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (outreachError) {
    throw new Error(`Failed to load outreach: ${outreachError.message}`);
  }

  const outreachRows = (outreachData ?? []) as OutreachRow[];

  const leadIds = [...new Set(outreachRows.map((o) => o.lead_id))];

  // Join via leads -> brands (since outreach.brand_id doesn't exist).
  const { data: leadsData, error: leadsError } = await (leadIds.length > 0
    ? supabase.from("leads").select("id,brand_id").in("id", leadIds)
    : Promise.resolve({ data: [], error: null as unknown }));

  if (leadsError) {
    const msg =
      typeof (leadsError as { message?: string }).message === "string"
        ? (leadsError as { message?: string }).message
        : String(leadsError);
    throw new Error(`Failed to load leads for outreach: ${msg}`);
  }

  const leadsRows = (leadsData ?? []) as LeadRow[];
  const brandIds = [...new Set(leadsRows.map((l) => l.brand_id))].filter(
    (id): id is string => typeof id === "string" && id.length > 0,
  );

  let brandsRows: BrandRow[] = [];
  if (brandIds.length > 0) {
    const { data, error } = await supabase
      .from("brands")
      .select("id,brand_name,website,brand_voice,price_tier")
      .in("id", brandIds);

    if (error) throw new Error(`Failed to load brands: ${error.message}`);
    brandsRows = (data ?? []) as BrandRow[];
  }

  const brandById = new Map<string, BrandRow>();
  for (const b of brandsRows) brandById.set(b.id, b);

  const leadById = new Map<string, LeadRow>();
  for (const l of leadsRows) leadById.set(l.id, l);

  const items: OutreachListItem[] = outreachRows.map((outreach) => {
    const lead = leadById.get(outreach.lead_id) ?? null;
    const brand = lead?.brand_id ? brandById.get(lead.brand_id) ?? null : null;

    let campaignStatus = "Queued";
    if (outreach.sent_at) campaignStatus = "Sent";
    if (outreach.replied) campaignStatus = "Replied";

    return {
      outreach,
      brand,
      contactEmail: outreach.contact_email,
      campaignStatus,
      replyReceived: outreach.replied,
    };
  });

  const totalSent = outreachRows.filter((o) => o.sent_at != null).length;
  const replies = outreachRows.filter((o) => o.replied === true).length;
  const bookedCalls = outreachRows.filter((o) =>
    (o.reply_sentiment ?? "").toLowerCase().includes("book"),
  ).length;

  return { items, totalSent, replies, bookedCalls };
}

