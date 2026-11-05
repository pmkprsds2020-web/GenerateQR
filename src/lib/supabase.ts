import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Server-side Supabase client used by the API routes.
// Configure via env: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (client) return client;
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!rawUrl || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  // Accept the URL with or without a trailing /rest/v1/
  const url = rawUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

// --- Row mapping: database uses snake_case, the frontend expects camelCase ---

export interface QrCodeRow {
  id: string;
  user_id: string | null;
  name: string;
  type: string;
  content: string;
  customization: string | null;
  file_path: string | null;
  is_public: boolean;
  scan_count: number;
  created_at: string;
  updated_at: string;
}

export function mapQrCode(row: QrCodeRow) {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    type: row.type,
    content: row.content,
    customization: row.customization,
    filePath: row.file_path,
    isPublic: row.is_public,
    scanCount: row.scan_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface TemplateRow {
  id: string;
  name: string;
  type: string;
  configuration: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function mapTemplate(row: TemplateRow) {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    configuration: row.configuration,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
