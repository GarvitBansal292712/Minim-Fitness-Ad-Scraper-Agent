import { getOutreachPageData } from "@/lib/queries/outreach";

function formatSentAt(sentAt: string | null) {
  if (!sentAt) return "—";
  const d = new Date(sentAt);
  if (Number.isNaN(d.getTime())) return sentAt;

  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ReplyBadge({ replyReceived }: { replyReceived: boolean | null }) {
  if (replyReceived) {
    return (
      <span className="inline-flex items-center gap-2 px-2.5 py-1 text-xs rounded-full bg-[#10B981]/10 text-[#059669] border border-[#10B981]/20">
        <span className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-full bg-[#10B981]/15">
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4.5 8L2.5 6L1.6 6.9L4.5 9.8L10.4 3.9L9.5 3L4.5 8Z"
              fill="#059669"
            />
          </svg>
        </span>
        Yes
      </span>
    );
  }

  return <span className="text-sm text-black/50">—</span>;
}

export default async function OutreachPage() {
  const { items, totalSent, replies, bookedCalls } =
    await getOutreachPageData();

  return (
    <div className="flex flex-col gap-6">
      <div className="glass-card p-5">
        <div className="text-[20px] font-semibold text-black/90">
          Outreach Tracker
        </div>
        <div className="mt-1 text-sm text-black/60">
          Monitor Instantly sequences and track replies.
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
          <div className="glass-card p-4">
            <div className="text-xs text-black/60">Total Sent</div>
            <div className="text-[22px] font-semibold text-black/90">
              {totalSent}
            </div>
          </div>
          <div className="glass-card p-4">
            <div className="text-xs text-black/60">Replies</div>
            <div className="text-[22px] font-semibold text-black/90">
              {replies}
            </div>
          </div>
          <div className="glass-card p-4">
            <div className="text-xs text-black/60">Booked Calls</div>
            <div className="text-[22px] font-semibold text-black/90">
              {bookedCalls}
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card p-5">
        {items.length === 0 ? (
          <div className="text-sm text-black/60">
            No outreach records yet. Once Agent 9 runs, email sequences will
            appear here.
          </div>
        ) : (
          <div className="overflow-auto rounded-[16px] border border-white/70 max-h-[620px]">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 bg-white/75 backdrop-blur-[12px] z-10">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-black/70 border-b border-white/70">
                    Brand
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-black/70 border-b border-white/70">
                    Contact Email
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-black/70 border-b border-white/70">
                    Sent At
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-black/70 border-b border-white/70">
                    Campaign Status
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-black/70 border-b border-white/70">
                    Reply Received
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.outreach.id} className="hover:bg-white/40">
                    <td className="px-4 py-4 border-b border-white/70 text-black/80 font-medium">
                      {item.brand?.brand_name ?? "Unknown brand"}
                    </td>
                    <td className="px-4 py-4 border-b border-white/70 text-black/70">
                      {item.contactEmail ?? "—"}
                    </td>
                    <td className="px-4 py-4 border-b border-white/70 text-black/70">
                      {formatSentAt(item.outreach.sent_at)}
                    </td>
                    <td className="px-4 py-4 border-b border-white/70 text-black/70">
                      {item.campaignStatus}
                    </td>
                    <td className="px-4 py-4 border-b border-white/70">
                      <ReplyBadge replyReceived={item.replyReceived} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

