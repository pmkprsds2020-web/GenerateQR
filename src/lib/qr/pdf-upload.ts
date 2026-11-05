"use client";

import type { SupabaseClient } from "@supabase/supabase-js";

// PDFs go straight from the browser to Supabase Storage (bucket "qr-pdfs").
// Uploading directly avoids Vercel's ~4.5 MB request body limit on API routes.
export const PDF_BUCKET = "qr-pdfs";
export const PDF_MAX_BYTES = 20 * 1024 * 1024; // keep in sync with schema.sql

let browserClient: SupabaseClient | null = null;

async function getBrowserSupabase(): Promise<SupabaseClient> {
  if (browserClient) return browserClient;
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!rawUrl || !key) {
    throw new Error("Supabase belum dikonfigurasi (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY).");
  }
  const { createClient } = await import("@supabase/supabase-js");
  const url = rawUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
  browserClient = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return browserClient;
}

export function formatFileSize(bytes?: number): string {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function validatePdfFile(file: File): string | null {
  const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
  if (!isPdf) return "File harus berformat PDF.";
  if (file.size === 0) return "File kosong.";
  if (file.size > PDF_MAX_BYTES) return `Ukuran file maksimal ${formatFileSize(PDF_MAX_BYTES)}.`;
  return null;
}

// Turn "Sertifikat Budi (final).pdf" into "sertifikat-budi-final.pdf"
function safeFileName(name: string): string {
  const base = name.replace(/\.pdf$/i, "");
  const slug = base
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `${slug || "dokumen"}.pdf`;
}

export interface UploadedPdf {
  url: string;
  path: string;
  fileName: string;
  size: number;
}

export async function uploadPdf(file: File): Promise<UploadedPdf> {
  const problem = validatePdfFile(file);
  if (problem) throw new Error(problem);

  const supabase = await getBrowserSupabase();
  const random = Math.random().toString(36).slice(2, 10);
  const path = `${new Date().toISOString().slice(0, 10)}/${Date.now()}-${random}-${safeFileName(file.name)}`;

  const { error } = await supabase.storage.from(PDF_BUCKET).upload(path, file, {
    contentType: "application/pdf",
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) {
    const msg = error.message || "";
    if (/bucket not found/i.test(msg)) {
      throw new Error('Bucket "qr-pdfs" belum dibuat. Jalankan supabase/schema.sql di Supabase SQL Editor.');
    }
    if (/row-level security|unauthorized|403/i.test(msg)) {
      throw new Error("Upload ditolak Supabase. Pastikan policy storage di supabase/schema.sql sudah dijalankan.");
    }
    if (/exceeded|too large|413/i.test(msg)) {
      throw new Error(`Ukuran file melebihi batas ${formatFileSize(PDF_MAX_BYTES)}.`);
    }
    throw new Error(msg || "Upload gagal.");
  }

  const { data } = supabase.storage.from(PDF_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, path, fileName: file.name, size: file.size };
}
