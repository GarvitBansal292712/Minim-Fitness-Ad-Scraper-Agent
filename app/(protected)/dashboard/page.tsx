import TriggerScanButton from "@/components/dashboard/TriggerScanButton";
import SupabaseConfigNotice from "@/components/shared/SupabaseConfigNotice";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import type { Database } from "@/types/database";

type ScanRun = Database["public"]["Tables"]["scan_runs"]["Row"];

function formatRunDate(runDate: string) {
  const d = new Date(runDate);
  if (Number.isNaN(d.getTime())) return runDate;

  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Progress({ run }: { run: ScanRun }) {
  // For now, `scan_runs` doesn't expose per-stage progress fields.
  // We map the high-level status to a reasonable placeholder.
  const progressAgents =
    run.status === "complete"
      ? 9
      : run.status === "running"
        ? 5
        : run.status === "paused"
          ? 3
          : 0;

  const widthPct = Math.max(0, Math.min(100, (progressAgents / 9) * 100));

  return (
    <div className="flex flex-col gap-1">
      <div className="text-xs text-black/60">
        {progressAgents} of 9 agents
      </div>
      <div className="h-2 bg-white/65 rounded-full overflow-hidden border border-white/70">
        <div
          className="h-full bg-gradient-to-r from-[#3B82F6] to-[#38BDF8]"
          style={{ width: `${widthPct}%` }}
        />
      </div>
    </div>
  );
}

function ScanStatusBadge({ status }: { status: ScanRun["status"] }) {
  if (status === "running") {
    return (
      <span className="inline-flex items-center gap-2 px-2.5 py-1 text-xs rounded-full bg-[#3B82F6]/10 text-[#2563EB] border border-[#3B82F6]/20">
        <span className="w-[6px] h-[6px] rounded-full bg-[#3B82F6] animate-pulse" />
        Running
      </span>
    );
  }

  if (status === "complete") {
    return (
      <span className="inline-flex items-center px-2.5 py-1 text-xs rounded-full bg-[#10B981]/10 text-[#059669] border border-[#10B981]/20">
        Complete
      </span>
    );
  }

  if (status === "paused") {
    return (
      <span className="inline-flex items-center px-2.5 py-1 text-xs rounded-full bg-white/65 text-black/60 border border-white/75">
        Paused
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-1 text-xs rounded-full bg-[#EF4444]/10 text-[#DC2626] border border-[#EF4444]/20">
      Failed
    </span>
  );
}

export default async function DashboardPage() {
  if (!hasSupabaseEnv()) {
    return <SupabaseConfigNotice />;
  }

  const { getDashboardData } = await import("@/lib/queries/dashboard");
  const { scanRuns, totalLeads, conceptsPending, emailsSent, replies } =
    await getDashboardData();

  return (
    <div className="flex flex-col gap-6">
      <div className="glass-card p-5">
        <div className="flex flex-col gap-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-[20px] font-semibold text-black/90">
                Pipeline Dashboard
              </div>
              <div className="mt-1 text-sm text-black/60">
                Track weekly automation runs and approve concepts.
              </div>
            </div>

            <div className="hidden lg:block">
              <TriggerScanButton />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-4">
              <div className="text-xs text-black/60">Total Leads</div>
              <div className="text-[22px] font-semibold text-black/90">
                {totalLeads}
              </div>
            </div>
            <div className="glass-card p-4">
              <div className="text-xs text-black/60">Concepts Pending</div>
              <div className="text-[22px] font-semibold text-black/90">
                {conceptsPending}
              </div>
            </div>
            <div className="glass-card p-4">
              <div className="text-xs text-black/60">Emails Sent</div>
              <div className="text-[22px] font-semibold text-black/90">
                {emailsSent}
              </div>
            </div>
            <div className="glass-card p-4">
              <div className="text-xs text-black/60">Replies</div>
              <div className="text-[22px] font-semibold text-black/90">
                {replies}
              </div>
            </div>
          </div>

          <div className="lg:hidden">
            <TriggerScanButton />
          </div>
        </div>
      </div>

      <div className="glass-card p-5">
        <div className="text-sm text-black/60 mb-3">Latest scan runs</div>

        {scanRuns.length === 0 ? (
          <div className="text-sm text-black/60">
            No scan runs yet. Trigger the first scan to start the weekly
            pipeline.
          </div>
        ) : (
          <div className="overflow-auto rounded-[16px] border border-white/70">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 bg-white/75 backdrop-blur-[12px] z-10">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-black/70 border-b border-white/70">
                    Run Date
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-black/70 border-b border-white/70">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-black/70 border-b border-white/70">
                    Progress
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-black/70 border-b border-white/70">
                    Leads
                  </th>
                </tr>
              </thead>
              <tbody>
                {scanRuns.map((run) => (
                  <tr key={run.id} className="hover:bg-white/40">
                    <td className="px-4 py-4 text-black/70 border-b border-white/70">
                      {formatRunDate(run.run_date)}
                    </td>
                    <td className="px-4 py-4">
                      <ScanStatusBadge status={run.status} />
                    </td>
                    <td className="px-4 py-4">
                      <Progress run={run} />
                    </td>
                    <td className="px-4 py-4 text-black/70 border-b border-white/70">
                      —
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
