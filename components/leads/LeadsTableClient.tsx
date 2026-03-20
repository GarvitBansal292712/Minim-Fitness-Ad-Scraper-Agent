"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Database } from "@/types/database";

type LeadRow = Database["public"]["Tables"]["leads"]["Row"];
type BrandRow = Database["public"]["Tables"]["brands"]["Row"];
type AdAssetRow = Database["public"]["Tables"]["ad_assets"]["Row"];

type LeadsStatusFilter = "all" | "new" | "processing" | "concept_ready" | "outreach_sent";

type LeadsListItem = {
  lead: LeadRow;
  brand: BrandRow | null;
  thumbnails: AdAssetRow[];
};

export default function LeadsTableClient(props: {
  items: LeadsListItem[];
  statusFilter: LeadsStatusFilter;
  page: number;
  totalPages: number;
}) {
  const router = useRouter();
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const selectedItem = useMemo(() => {
    if (!selectedLeadId) return null;
    return props.items.find((i) => i.lead.id === selectedLeadId) ?? null;
  }, [props.items, selectedLeadId]);

  function onChangeFilter(nextStatus: LeadsStatusFilter) {
    const qs = new URLSearchParams();
    qs.set("status", nextStatus);
    qs.set("page", "1");
    router.push(`/leads?${qs.toString()}`);
  }

  function onChangePage(nextPage: number) {
    const qs = new URLSearchParams();
    qs.set("status", props.statusFilter);
    qs.set("page", String(nextPage));
    router.push(`/leads?${qs.toString()}`);
  }

  const tabs: Array<{ id: LeadsStatusFilter; label: string }> = [
    { id: "all", label: "All" },
    { id: "new", label: "New" },
    { id: "processing", label: "Processing" },
    { id: "concept_ready", label: "Concept Ready" },
    { id: "outreach_sent", label: "Outreach Sent" },
  ];

  function StatusBadge({ status }: { status: LeadRow["status"] }) {
    if (status === "new") {
      return (
        <span className="inline-flex items-center px-2.5 py-1 text-xs rounded-full bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20">
          New
        </span>
      );
    }

    if (status === "processing") {
      return (
        <span className="inline-flex items-center px-2.5 py-1 text-xs rounded-full bg-white/65 text-black/60 border border-white/75">
          Processing
        </span>
      );
    }

    if (status === "concept_ready") {
      return (
        <span className="inline-flex items-center px-2.5 py-1 text-xs rounded-full bg-[#38BDF8]/15 text-[#0284C7] border border-[#38BDF8]/25">
          Concept Ready
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2.5 py-1 text-xs rounded-full bg-[#10B981]/10 text-[#059669] border border-[#10B981]/20">
        Outreach Sent
      </span>
    );
  }

  function renderPlatforms(platforms: LeadRow["platforms"]) {
    if (!platforms) return "—";
    if (Array.isArray(platforms)) return platforms.join(", ");
    if (typeof platforms === "string") return platforms;
    return "—";
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="glass-card p-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="text-[18px] font-semibold text-black/90">
              Leads
            </div>
            <div className="mt-1 text-sm text-black/60">
              Review leads and inspect creatives.
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            {tabs.map((t) => {
              const active = t.id === props.statusFilter;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onChangeFilter(t.id)}
                  className={[
                    "px-3 py-2 text-sm rounded-[10px] border transition-colors",
                    active
                      ? "bg-white/72 text-[#3B82F6] border-white/80"
                      : "bg-white/55 text-black/70 border-white/70 hover:bg-white/65",
                  ].join(" ")}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="glass-card p-0">
        <div className="overflow-auto rounded-[16px] border border-white/70 max-h-[560px]">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-white/75 backdrop-blur-[12px] z-10">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-black/70 border-b border-white/70">
                  Brand
                </th>
                <th className="text-left px-4 py-3 font-medium text-black/70 border-b border-white/70">
                  Status
                </th>
                <th className="text-left px-4 py-3 font-medium text-black/70 border-b border-white/70">
                  Assets Ingested
                </th>
                <th className="text-left px-4 py-3 font-medium text-black/70 border-b border-white/70">
                  Active Ads
                </th>
                <th className="text-left px-4 py-3 font-medium text-black/70 border-b border-white/70">
                  Runtime (Days)
                </th>
              </tr>
            </thead>
            <tbody>
              {props.items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-black/60">
                    No leads match this filter yet.
                  </td>
                </tr>
              ) : (
                props.items.map((item) => (
                  <tr
                    key={item.lead.id}
                    className="cursor-pointer hover:bg-white/40"
                    onClick={() => setSelectedLeadId(item.lead.id)}
                  >
                    <td className="px-4 py-4 border-b border-white/70 text-black/80 font-medium">
                      {item.brand?.brand_name ?? "Unknown brand"}
                    </td>
                    <td className="px-4 py-4 border-b border-white/70">
                      <StatusBadge status={item.lead.status} />
                    </td>
                    <td className="px-4 py-4 border-b border-white/70">
                      {item.lead.assets_ingested ? (
                        <span className="inline-flex items-center px-2.5 py-1 text-xs rounded-full bg-[#10B981]/10 text-[#059669] border border-[#10B981]/20">
                          Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 text-xs rounded-full bg-white/65 text-black/60 border border-white/75">
                          —
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 border-b border-white/70 text-black/70">
                      {item.lead.active_ad_count ?? 0}
                    </td>
                    <td className="px-4 py-4 border-b border-white/70 text-black/70">
                      {item.lead.ad_runtime_days ?? 0}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-white/70">
          <div className="text-sm text-black/60">
            Page <span className="font-medium text-black/80">{props.page}</span>{" "}
            of{" "}
            <span className="font-medium text-black/80">{props.totalPages}</span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onChangePage(Math.max(1, props.page - 1))}
              disabled={props.page <= 1}
              className="h-[40px] px-3 rounded-[10px] bg-white/55 backdrop-blur-[12px] border border-white/75 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => onChangePage(Math.min(props.totalPages, props.page + 1))}
              disabled={props.page >= props.totalPages}
              className="h-[40px] px-3 rounded-[10px] bg-gradient-to-r from-[#3B82F6] to-[#38BDF8] text-white font-medium shadow-[0_4px_14px_rgba(59,130,246,0.3)] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {selectedItem ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close drawer"
            className="absolute inset-0 w-full h-full bg-black/5"
            onClick={() => setSelectedLeadId(null)}
          />

          <div className="absolute right-0 top-0 h-full w-full max-w-[520px] p-5 overflow-auto glass-card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[18px] font-semibold text-black/90">
                  {selectedItem.brand?.brand_name ?? "Unknown brand"}
                </div>
                <div className="mt-1 text-sm text-black/60">
                  Lead status:{" "}
                  <span className="font-medium text-black/80">
                    {selectedItem.lead.status}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedLeadId(null)}
                className="h-[40px] px-3 rounded-[10px] bg-white/55 backdrop-blur-[12px] border border-white/75"
              >
                Close
              </button>
            </div>

            <div className="mt-6 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div className="text-sm font-medium text-black/80">
                  Brand Info
                </div>
                {selectedItem.brand?.website ? (
                  <a
                    className="text-sm text-[#3B82F6] underline underline-offset-2 break-all"
                    href={selectedItem.brand.website}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {selectedItem.brand.website}
                  </a>
                ) : (
                  <div className="text-sm text-black/60">Website: —</div>
                )}
                <div className="text-sm text-black/60">
                  Voice: {selectedItem.brand?.brand_voice ?? "—"}
                </div>
                <div className="text-sm text-black/60">
                  Price Tier: {selectedItem.brand?.price_tier ?? "—"}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="text-sm font-medium text-black/80">
                  Ad Creatives
                </div>
                {selectedItem.thumbnails.length === 0 ? (
                  <div className="text-sm text-black/60">
                    No thumbnails ingested yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {selectedItem.thumbnails.map((a) => (
                      <div key={a.id} className="rounded-[10px] overflow-hidden">
                        {/* `stored_url` is public Supabase Storage URL */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={a.stored_url}
                          alt="Ad creative thumbnail"
                          className="w-full aspect-video object-cover bg-white/70 border border-white/60"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <div className="text-sm font-medium text-black/80">
                  Lead Metadata
                </div>
                <div className="text-sm text-black/60">
                  Active Ads:{" "}
                  <span className="font-medium text-black/80">
                    {selectedItem.lead.active_ad_count ?? 0}
                  </span>
                </div>
                <div className="text-sm text-black/60">
                  Ad Runtime (Days):{" "}
                  <span className="font-medium text-black/80">
                    {selectedItem.lead.ad_runtime_days ?? 0}
                  </span>
                </div>
                <div className="text-sm text-black/60">
                  Platforms:{" "}
                  <span className="font-medium text-black/80">
                    {renderPlatforms(selectedItem.lead.platforms)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

