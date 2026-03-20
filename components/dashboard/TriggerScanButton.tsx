"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function TriggerScanButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const n8nWebhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;

  async function onTrigger() {
    setErrorMessage(null);
    if (!n8nWebhookUrl || n8nWebhookUrl === "your_webhook_url_here") {
      setErrorMessage("n8n webhook URL is not configured.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(n8nWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // The backend pipeline owns the payload shape; empty body is safe.
        body: JSON.stringify({}),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Webhook error (${res.status})`);
      }

      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to trigger scan.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {isLoading ? (
        <div className="h-[44px] rounded-[10px] bg-white/60 backdrop-blur-[12px] border border-white/75 animate-pulse" />
      ) : (
        <button
          type="button"
          onClick={onTrigger}
          disabled={isLoading}
          className="h-[44px] px-5 rounded-[10px] bg-gradient-to-r from-[#3B82F6] to-[#38BDF8] text-white font-medium shadow-[0_4px_14px_rgba(59,130,246,0.3)] hover:brightness-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Trigger Scan
        </button>
      )}
      {errorMessage ? (
        <div className="text-sm text-black/70 bg-white/65 border border-white/75 rounded-[10px] px-3 py-2">
          {errorMessage}
        </div>
      ) : null}
    </div>
  );
}

