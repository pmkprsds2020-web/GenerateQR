// QR Code download utilities: PNG, JPG, SVG, PDF
import QRCode from "qrcode";
import jsPDF from "jspdf";
import type { QrCustomization } from "./qr-types";

export type DownloadFormat = "png" | "jpg" | "svg" | "pdf";

export interface DownloadOptions {
  format: DownloadFormat;
  size: number; // px for raster, scale for svg
  content: string;
  customization: QrCustomization;
  filename: string;
}

/**
 * Generate an SVG string for a QR code with optional logo and rounded dots.
 */
export async function generateSvgString(
  content: string,
  customization: QrCustomization,
  size = 512
): Promise<string> {
  const qrData = await QRCode.create(content, {
    errorCorrectionLevel: customization.errorCorrectionLevel,
  });

  const modules = qrData.modules;
  const count = modules.size;
  const margin = customization.margin || 0;
  const totalModules = count + margin * 2;
  const moduleSize = size / totalModules;

  const shape = customization.pixelShape || "square";
  const radius = shape === "dots" ? moduleSize / 2 : shape === "rounded" ? moduleSize * 0.3 : 0;

  let modulesSvg = "";
  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (modules.get(r, c)) {
        const x = (c + margin) * moduleSize;
        const y = (r + margin) * moduleSize;
        if (radius > 0) {
          modulesSvg += `<circle cx="${x + moduleSize / 2}" cy="${y + moduleSize / 2}" r="${radius}" />`;
        } else if (shape === "rounded") {
          modulesSvg += `<rect x="${x}" y="${y}" width="${moduleSize}" height="${moduleSize}" rx="${radius}" />`;
        } else {
          modulesSvg += `<rect x="${x}" y="${y}" width="${moduleSize}" height="${moduleSize}" />`;
        }
      }
    }
  }

  let logoSvg = "";
  if (customization.logoDataUrl) {
    const logoSizePct = (customization.logoSize || 20) / 100;
    const logoSize = size * logoSizePct;
    const logoOffset = (size - logoSize) / 2;
    const pad = logoSize * 0.15;
    // White background for logo
    logoSvg = `<rect x="${logoOffset - pad}" y="${logoOffset - pad}" width="${logoSize + pad * 2}" height="${logoSize + pad * 2}" fill="${customization.bgColor}" rx="8"/>`;
    logoSvg += `<image href="${customization.logoDataUrl}" x="${logoOffset}" y="${logoOffset}" width="${logoSize}" height="${logoSize}"/>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges">
  <rect width="${size}" height="${size}" fill="${customization.bgColor}"/>
  <g fill="${customization.fgColor}">${modulesSvg}</g>
  ${logoSvg}
</svg>`;

  return svg;
}

/**
 * Render QR to a canvas element.
 */
async function renderToCanvas(
  content: string,
  customization: QrCustomization,
  size: number
): Promise<HTMLCanvasElement> {
  const svgString = await generateSvgString(content, customization, size);
  const img = new Image();
  return new Promise((resolve, reject) => {
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context not available"));
        return;
      }
      ctx.drawImage(img, 0, 0, size, size);
      resolve(canvas);
    };
    img.onerror = () => reject(new Error("Failed to render QR image"));
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgString)));
  });
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function downloadQrCode(opts: DownloadOptions): Promise<void> {
  const { format, size, content, customization, filename } = opts;

  if (format === "svg") {
    const svg = await generateSvgString(content, customization, Math.max(size, 512));
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    triggerDownload(blob, `${filename}.svg`);
    return;
  }

  const canvas = await renderToCanvas(content, customization, size);

  if (format === "png") {
    await new Promise<void>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          triggerDownload(blob, `${filename}.png`);
          resolve();
        } else reject(new Error("Failed to create PNG"));
      }, "image/png");
    });
    return;
  }

  if (format === "jpg") {
    // For JPG, fill background (no transparency)
    const jpgCanvas = document.createElement("canvas");
    jpgCanvas.width = size;
    jpgCanvas.height = size;
    const ctx = jpgCanvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context not available");
    ctx.fillStyle = customization.bgColor || "#ffffff";
    ctx.fillRect(0, 0, size, size);
    ctx.drawImage(canvas, 0, 0);
    await new Promise<void>((resolve, reject) => {
      jpgCanvas.toBlob((blob) => {
        if (blob) {
          triggerDownload(blob, `${filename}.jpg`);
          resolve();
        } else reject(new Error("Failed to create JPG"));
      }, "image/jpeg", 0.95);
    });
    return;
  }

  if (format === "pdf") {
    const pdf = new jsPDF({
      orientation: "square",
      unit: "mm",
      format: [100, 100],
    });
    const pngData = canvas.toDataURL("image/png");
    pdf.addImage(pngData, "PNG", 0, 0, 100, 100);
    pdf.save(`${filename}.pdf`);
    return;
  }
}

/**
 * Copy the QR image (as PNG) to clipboard.
 */
export async function copyQrImage(content: string, customization: QrCustomization): Promise<boolean> {
  try {
    const canvas = await renderToCanvas(content, customization, 512);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/png")
    );
    if (!blob) return false;
    if (navigator.clipboard && (window as any).ClipboardItem) {
      await (navigator.clipboard as any).write([
        new (window as any).ClipboardItem({ "image/png": blob }),
      ]);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Quality check for QR code.
 */
export function checkQrQuality(
  content: string,
  customization: QrCustomization
): { ok: boolean; warnings: string[]; errors: string[] } {
  const warnings: string[] = [];
  const errors: string[] = [];

  if (!content.trim()) {
    errors.push("Konten QR Code kosong.");
  }

  // Contrast check
  const fg = hexToRgb(customization.fgColor);
  const bg = hexToRgb(customization.bgColor);
  if (fg && bg) {
    const contrast = contrastRatio(fg, bg);
    if (contrast < 2) {
      errors.push("Kontras warna terlalu rendah. QR Code mungkin tidak dapat dipindai.");
    } else if (contrast < 4.5) {
      warnings.push("Kontras warna rendah, disarankan menggunakan warna yang lebih berlawanan.");
    }
  }

  // Logo size check
  if (customization.logoDataUrl) {
    const logoSize = customization.logoSize || 20;
    if (logoSize > 30) {
      warnings.push("Logo terlalu besar dan dapat mengurangi kemampuan QR untuk dipindai.");
    }
    if (customization.errorCorrectionLevel !== "H") {
      warnings.push("Disarankan menggunakan error correction level H saat menggunakan logo.");
    }
  }

  // Quiet zone check
  if (customization.margin < 1) {
    warnings.push("Quiet zone terlalu sempit. Disarankan minimal margin 1.");
  }

  // URL safety check
  if (/^https?:\/\//i.test(content)) {
    if (/^http:\/\//i.test(content)) {
      warnings.push("URL menggunakan HTTP (tidak aman). Disarankan menggunakan HTTPS.");
    }
    if (content.length > 200) {
      warnings.push("URL terlalu panjang, dapat membuat QR Code padat dan sulit dipindai.");
    }
  }

  return { ok: errors.length === 0, warnings, errors };
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : null;
}

function luminance({ r, g, b }: { r: number; g: number; b: number }): number {
  const a = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function contrastRatio(c1: { r: number; g: number; b: number }, c2: { r: number; g: number; b: number }): number {
  const l1 = luminance(c1);
  const l2 = luminance(c2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}
