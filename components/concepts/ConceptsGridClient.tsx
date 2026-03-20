"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import type {
  ConceptsListItem,
  ConceptsStatusFilter,
} from "@/lib/queries/concepts";

type LoadingAction = "approve" | "reject";

export default function ConceptsGridClient(props: {
  items: ConceptsListItem[];
  statusFilter: ConceptsStatusFilter;
}) {
  const router = useRouter();
  const [notesById, setNotesById] = useState<Record<string, string>>({});
  const [rejectOpenById, setRejectOpenById] = useState<Record<string, boolean>>(
    {},
  );
  const [loading, setLoading] = useState<{
    conceptId: string;
    action: LoadingAction;
  } | null>(null);
  const [cardErrorById, setCardErrorById] = useState<Record<string, string>>({});

  const tabs: Array<{ id: ConceptsStatusFilter; label: string }> = useMemo(
    () => [
      { id: "pending", label: "Pending" },
      { id: "approved", label: "Approved" },
      { id: "rejected", label: "Rejected" },
    ],
    [],
  );

  function onChangeTab(nextStatus: ConceptsStatusFilter) {
    router.push(`/concepts?status=${nextStatus}`);
  }

  function truncate(text: string, maxLen: number) {
    if (text.length <= maxLen) return text;
    return `${text.slice(0, maxLen)}…`;
  }

  async function onApprove(conceptId: string, leadId: string) {
    setCardErrorById((prev) => ({ ...prev, [conceptId]: "" }));
    setLoading({ conceptId, action: "approve" });

    const payload = { status: "concept_ready" } as unknown as never;

    const { error } = await supabase
      .from("leads")
      .update(payload)
      .eq("id", leadId);

    setLoading(null);
    if (error) {
      setCardErrorById((prev) => ({
        ...prev,
        [conceptId]: error.message,
      }));
      return;
    }

    router.refresh();
  }

  function onOpenReject(conceptId: string) {
    setCardErrorById((prev) => ({ ...prev, [conceptId]: "" }));
    setRejectOpenById((prev) => ({ ...prev, [conceptId]: true }));
  }

  function onCancelReject(conceptId: string) {
    setRejectOpenById((prev) => ({ ...prev, [conceptId]: false }));
    setNotesById((prev) => ({ ...prev, [conceptId]: "" }));
    setCardErrorById((prev) => ({ ...prev, [conceptId]: "" }));
  }

  async function onSubmitReject(conceptId: string, leadId: string) {
    setCardErrorById((prev) => ({ ...prev, [conceptId]: "" }));

    const notes = (notesById[conceptId] ?? "").trim();
    if (!notes) {
      setCardErrorById((prev) => ({
        ...prev,
        [conceptId]: "Add rejection notes before submitting.",
      }));
      return;
    }

    setLoading({ conceptId, action: "reject" });

    const statusPayload = { status: "rejected" } as unknown as never;
    const { error } = await supabase
      .from("leads")
      .update(statusPayload)
      .eq("id", leadId);

    if (error) {
      setLoading(null);
      setCardErrorById((prev) => ({
        ...prev,
        [conceptId]: error.message,
      }));
      return;
    }

    setLoading(null);
    setRejectOpenById((prev) => ({ ...prev, [conceptId]: false }));
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="glass-card p-5">
        <div className="flex flex-col gap-4">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <div className="text-[18px] font-semibold text-black/90">
                Concepts Approval
              </div>
              <div className="mt-1 text-sm text-black/60">
                Approve pending concepts to unblock outreach.
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              {tabs.map((t) => {
                const active = t.id === props.statusFilter;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onChangeTab(t.id)}
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
      </div>

      {props.items.length === 0 ? (
        <div className="text-sm text-black/60">
          No concepts found for this tab yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {props.items.map((item) => {
            const concept = item.concept;
            const conceptId = concept.id;
            const rejectOpen = rejectOpenById[conceptId] ?? false;

            const leadStatus = item.leadStatus;
            const uiStatus =
              leadStatus === "concept_generated"
                ? "pending"
                : leadStatus === "concept_ready"
                  ? "approved"
                  : leadStatus === "rejected"
                    ? "rejected"
                    : "pending";

            const canApprove = uiStatus === "pending";
            const canReject = uiStatus === "pending";

            const approveDisabled =
              loading?.conceptId === conceptId && loading.action === "approve";
            const rejectDisabled =
              loading?.conceptId === conceptId && loading.action === "reject";

            return (
              <div key={conceptId} className="glass-card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm text-black/60">Brand</div>
                    <div className="text-[16px] font-semibold text-black/90 mt-1">
                      {item.brand?.brand_name ?? "Unknown brand"}
                    </div>
                  </div>

                  <div className="text-xs text-black/60">
                    Status:{" "}
                    <span className="font-medium text-black/80">
                      {uiStatus}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-3">
                  <div>
                    <div className="text-xs text-black/60">Hook</div>
                    <div className="text-sm text-black/80 font-medium">
                      {truncate(String(concept.hook_shot ?? "—"), 160)}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-black/60">Visual Style</div>
                    <div className="text-sm text-black/80">
                      {truncate(String(concept.visual_sequence ?? "—"), 180)}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-black/60">CTA</div>
                    <div className="text-sm text-black/80">
                      {truncate(String(concept.tagline ?? "—"), 120)}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-black/60">Narrative</div>
                    <div className="text-sm text-black/80">
                      {truncate(String(concept.why_it_wins ?? "—"), 220)}
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-2">
                  {uiStatus === "pending" ? (
                    <div className="flex gap-2 flex-wrap">
                      <button
                        type="button"
                        disabled={!canApprove || approveDisabled}
                        onClick={() => onApprove(conceptId, concept.lead_id)}
                        className="h-[40px] px-4 rounded-[10px] bg-gradient-to-r from-[#3B82F6] to-[#38BDF8] text-white font-medium shadow-[0_4px_14px_rgba(59,130,246,0.3)] disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {approveDisabled ? "Approving..." : "Approve"}
                      </button>

                      <button
                        type="button"
                        disabled={!canReject || rejectDisabled}
                        onClick={() => onOpenReject(conceptId)}
                        className="h-[40px] px-4 rounded-[10px] bg-white/55 backdrop-blur-[12px] border border-white/75 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2 flex-wrap">
                      <button
                        type="button"
                        disabled
                        className="h-[40px] px-4 rounded-[10px] bg-white/55 backdrop-blur-[12px] border border-white/75 text-black/60 cursor-not-allowed"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        disabled
                        className="h-[40px] px-4 rounded-[10px] bg-white/55 backdrop-blur-[12px] border border-white/75 text-black/60 cursor-not-allowed"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {rejectOpen && uiStatus === "pending" ? (
                    <div className="flex flex-col gap-2">
                      <textarea
                        value={notesById[conceptId] ?? ""}
                        onChange={(e) =>
                          setNotesById((prev) => ({
                            ...prev,
                            [conceptId]: e.target.value,
                          }))
                        }
                        placeholder="Rejection notes (brief, actionable)"
                        className="min-h-[84px] px-3 py-2 rounded-[10px] border border-white/75 bg-white/70 backdrop-blur-[12px] outline-none text-sm"
                      />

                      {cardErrorById[conceptId] ? (
                        <div className="text-sm text-black/70 bg-white/65 border border-white/75 rounded-[10px] px-3 py-2">
                          {cardErrorById[conceptId]}
                        </div>
                      ) : null}

                      <div className="flex gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => onSubmitReject(conceptId, concept.lead_id)}
                          disabled={rejectDisabled}
                          className="h-[40px] px-4 rounded-[10px] bg-white/55 backdrop-blur-[12px] border border-white/75 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {rejectDisabled ? "Saving..." : "Confirm Reject"}
                        </button>
                        <button
                          type="button"
                          onClick={() => onCancelReject(conceptId)}
                          className="h-[40px] px-4 rounded-[10px] bg-white/55 backdrop-blur-[12px] border border-white/75"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

