export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-[620px] glass-card p-8">
        <div className="flex flex-col gap-5">
          <div>
            <div className="text-[22px] font-semibold text-black/90">MINIM</div>
            <div className="mt-2 text-sm text-black/60">
              Human control layer for your weekly video production pipeline.
            </div>
          </div>

          <div className="flex gap-3 flex-wrap">
            <a
              href="/login"
              className="h-[44px] px-5 rounded-[10px] bg-gradient-to-r from-[#3B82F6] to-[#38BDF8] text-white font-medium shadow-[0_4px_14px_rgba(59,130,246,0.3)] inline-flex items-center justify-center"
            >
              Sign in
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
