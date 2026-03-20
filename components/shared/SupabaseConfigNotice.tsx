export default function SupabaseConfigNotice() {
  return (
    <div className="glass-card p-6">
      <div className="text-[20px] font-semibold text-black/90">
        Supabase configuration required
      </div>
      <p className="mt-2 text-sm text-black/60">
        Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
        in your Vercel project settings, then redeploy to enable authentication
        and dashboard data.
      </p>
    </div>
  );
}
