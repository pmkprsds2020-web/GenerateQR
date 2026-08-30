"use client";

import * as React from "react";
import QRCode from "qrcode";
import type { QrCustomization } from "@/lib/qr/qr-types";

interface QrPreviewProps {
  content: string;
  customization: QrCustomization;
  size?: number;
  className?: string;
}

export function QrPreview({ content, customization, size = 320, className }: QrPreviewProps) {
  const [svg, setSvg] = React.useState<string>("");
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      if (!content.trim()) {
        setSvg("");
        return;
      }
      generateSvg(content, customization, size)
        .then((s) => {
          if (!cancelled) setSvg(s);
        })
        .catch(() => {
          if (!cancelled) setSvg("");
        });
    }, 120);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [content, customization.fgColor, customization.bgColor, customization.margin, customization.errorCorrectionLevel, customization.logoDataUrl, customization.logoSize, customization.pixelShape, size]);

  if (!content.trim()) {
    return (
      <div
        ref={containerRef}
        className={className}
        style={{ width: size, height: size, maxWidth: "100%" }}
        aria-label="Preview QR Code kosong"
      >
        <div className="w-full h-full rounded-xl border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center text-muted-foreground/60 bg-muted/30">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <path d="M14 14h3v3h-3z M18 18h3v3h-3z" />
          </svg>
          <p className="text-sm mt-2 text-center px-4">Isi data untuk melihat preview QR Code</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: size, height: size, maxWidth: "100%" }}
      dangerouslySetInnerHTML={{ __html: svg }}
      aria-label="Preview QR Code"
    />
  );
}

async function generateSvg(content: string, customization: QrCustomization, size: number): Promise<string> {
  try {
    const qrData = QRCode.create(content, {
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
          if (shape === "dots") {
            modulesSvg += `<circle cx="${x + moduleSize / 2}" cy="${y + moduleSize / 2}" r="${radius}"/>`;
          } else if (shape === "rounded") {
            modulesSvg += `<rect x="${x}" y="${y}" width="${moduleSize}" height="${moduleSize}" rx="${radius}"/>`;
          } else {
            modulesSvg += `<rect x="${x}" y="${y}" width="${moduleSize}" height="${moduleSize}"/>`;
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
      logoSvg = `<rect x="${logoOffset - pad}" y="${logoOffset - pad}" width="${logoSize + pad * 2}" height="${logoSize + pad * 2}" fill="${customization.bgColor}" rx="8"/>`;
      logoSvg += `<image href="${customization.logoDataUrl}" x="${logoOffset}" y="${logoOffset}" width="${logoSize}" height="${logoSize}" preserveAspectRatio="xMidYMid meet"/>`;
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 ${size} ${size}" shape-rendering="geometricPrecision" style="max-width:100%;height:auto;">
  <rect width="${size}" height="${size}" fill="${customization.bgColor}"/>
  <g fill="${customization.fgColor}">${modulesSvg}</g>
  ${logoSvg}
</svg>`;
  } catch {
    return "";
  }
}
