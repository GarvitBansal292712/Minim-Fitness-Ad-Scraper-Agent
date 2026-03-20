// Minimal Supabase type definitions for the MINIM dashboard.
// These types intentionally cover only the tables we use in the UI.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export interface Database {
  public: {
    Tables: {
      scan_runs: {
        Row: {
          id: string;
          status: "running" | "complete" | "failed" | "paused";
          run_date: string;
        };
        Insert: {
          id?: string;
          status?: "running" | "complete" | "failed" | "paused";
          run_date?: string;
        };
        Update: {
          id?: string;
          status?: "running" | "complete" | "failed" | "paused";
          run_date?: string;
        };
      };

      brands: {
        Row: {
          id: string;
          brand_name: string;
          page_id: string | null;
          website: string | null;
          last_scanned: string | null;
          brand_voice: string | null;
          price_tier: string | null;
          taglines_found: string[] | null;
          active_ad_count: number | null;
        };
        Insert: {
          id?: string;
          brand_name?: string;
          page_id?: string | null;
          website?: string | null;
          last_scanned?: string | null;
          brand_voice?: string | null;
          price_tier?: string | null;
          taglines_found?: string[] | null;
          active_ad_count?: number | null;
        };
        Update: {
          id?: string;
          brand_name?: string;
          page_id?: string | null;
          website?: string | null;
          last_scanned?: string | null;
          brand_voice?: string | null;
          price_tier?: string | null;
          taglines_found?: string[] | null;
          active_ad_count?: number | null;
        };
      };

      leads: {
        Row: {
          id: string;
          brand_id: string;
          scan_run_id: string;
          status: "new" | "processing" | "concept_ready" | "outreach_sent";
          assets_ingested: boolean | null;
          active_ad_count: number | null;
          ad_runtime_days: number | null;
          platforms: Json | null;
          preview_urls: Json | null;
          ad_ids: Json | null;
        };
        Insert: {
          id?: string;
          brand_id?: string;
          scan_run_id?: string;
          status?:
            | "new"
            | "processing"
            | "concept_ready"
            | "outreach_sent";
          assets_ingested?: boolean | null;
          active_ad_count?: number | null;
          ad_runtime_days?: number | null;
          platforms?: Json | null;
          preview_urls?: Json | null;
          ad_ids?: Json | null;
        };
        Update: {
          id?: string;
          brand_id?: string;
          scan_run_id?: string;
          status?:
            | "new"
            | "processing"
            | "concept_ready"
            | "outreach_sent";
          assets_ingested?: boolean | null;
          active_ad_count?: number | null;
          ad_runtime_days?: number | null;
          platforms?: Json | null;
          preview_urls?: Json | null;
          ad_ids?: Json | null;
        };
      };

      ad_assets: {
        Row: {
          id: string;
          lead_id: string;
          brand_id: string;
          original_url: string;
          storage_path: string;
          stored_url: string;
          asset_type: "thumbnail";
          ingested_at: string;
        };
        Insert: {
          id?: string;
          lead_id?: string;
          brand_id?: string;
          original_url?: string;
          storage_path?: string;
          stored_url?: string;
          asset_type?: "thumbnail";
          ingested_at?: string;
        };
        Update: {
          id?: string;
          lead_id?: string;
          brand_id?: string;
          original_url?: string;
          storage_path?: string;
          stored_url?: string;
          asset_type?: "thumbnail";
          ingested_at?: string;
        };
      };

      contacts: {
        Row: {
          id: string;
          lead_id: string;
          brand_id: string;
          email: string;
          name: string | null;
          title: string | null;
        };
        Insert: {
          id?: string;
          lead_id?: string;
          brand_id?: string;
          email?: string;
          name?: string | null;
          title?: string | null;
        };
        Update: {
          id?: string;
          lead_id?: string;
          brand_id?: string;
          email?: string;
          name?: string | null;
          title?: string | null;
        };
      };

      concepts: {
        Row: {
          id: string;
          lead_id: string;
          hook: string;
          visual_style: string;
          cta: string;
          narrative: string;
          status: "pending" | "approved" | "rejected";
          rejection_notes: string | null;
        };
        Insert: {
          id?: string;
          lead_id?: string;
          hook?: string;
          visual_style?: string;
          cta?: string;
          narrative?: string;
          status?: "pending" | "approved" | "rejected";
          rejection_notes?: string | null;
        };
        Update: {
          id?: string;
          lead_id?: string;
          hook?: string;
          visual_style?: string;
          cta?: string;
          narrative?: string;
          status?: "pending" | "approved" | "rejected";
          rejection_notes?: string | null;
        };
      };

      outreach: {
        Row: {
          id: string;
          lead_id: string;
          brand_id: string;
          campaign_id: string | null;
          email_sent_at: string | null;
          status: string | null;
          reply_received: boolean | null;
        };
        Insert: {
          id?: string;
          lead_id?: string;
          brand_id?: string;
          campaign_id?: string | null;
          email_sent_at?: string | null;
          status?: string | null;
          reply_received?: boolean | null;
        };
        Update: {
          id?: string;
          lead_id?: string;
          brand_id?: string;
          campaign_id?: string | null;
          email_sent_at?: string | null;
          status?: string | null;
          reply_received?: boolean | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

