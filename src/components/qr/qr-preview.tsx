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
  const [loading, setLoading] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    let cancelled = false;
    if (!content.trim()) {
      setSvg("");
      setLoading(false);
      return;
    }
    setLoading(true);
    const timer = setTimeout(() => {
      generateSvg(content, customization, size)
        .then((s) => {
          if (!cancelled) {
            setSvg(s);
            setLoading(false);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setSvg("");
            setLoading(false);
          }
        });
    }, 120);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [content, customization.fgColor, customization.bgColor, customization.margin, customization.errorCorrectionLevel, customization.logoDataUrl, customization.logoSize, customization.pixelShape, customization.gradientEnabled, customization.gradientColor1, customization.gradientColor2, customization.gradientDirection, customization.frameEnabled, customization.frameStyle, customization.frameColor, customization.frameText, size]);

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

  if (loading && !svg) {
    return (
      <div
        ref={containerRef}
        className={className}
        style={{ width: size, height: size, maxWidth: "100%" }}
        aria-label="Memuat QR Code"
      >
        <div className="w-full h-full rounded-xl bg-muted/30 overflow-hidden relative">
          <div className="absolute inset-0 shimmer" />
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

    const useGradient = customization.gradientEnabled && customization.gradientColor1 && customization.gradientColor2;
    const gradId = "qr-grad-" + Math.random().toString(36).slice(2, 8);
    const direction = customization.gradientDirection ?? 135;
    const rad = (direction * Math.PI) / 180;
    const x2 = (Math.cos(rad) * 0.5 + 0.5) * 100;
    const y2 = (Math.sin(rad) * 0.5 + 0.5) * 100;

    const fillDef = useGradient
      ? `<defs><linearGradient id="${gradId}" x1="0%" y1="0%" x2="${x2}%" y2="${y2}%"><stop offset="0%" stop-color="${customization.gradientColor1}"/><stop offset="100%" stop-color="${customization.gradientColor2}"/></linearGradient></defs>`
      : "";
    const fillValue = useGradient ? `url(#${gradId})` : customization.fgColor;

    // Frame rendering
    const useFrame = customization.frameEnabled;
    if (useFrame) {
      const frameColor = customization.frameColor || customization.fgColor;
      const frameText = (customization.frameText || "Scan Me").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const frameStyle = customization.frameStyle || "rounded";
      const pad = size * 0.06;
      const textH = size * 0.1;
      const qrAreaSize = size - pad * 2;
      const qrH = qrAreaSize - textH;
      const rx = frameStyle === "rounded" ? 20 : frameStyle === "circle" ? size / 2 : 0;

      return `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 ${size} ${size}" shape-rendering="geometricPrecision" style="max-width:100%;height:auto;">
  ${fillDef}
  <rect x="0" y="0" width="${size}" height="${size}" rx="${rx}" fill="${frameColor}"/>
  <rect x="${pad}" y="${pad}" width="${qrAreaSize}" height="${qrH}" rx="${Math.max(0, rx - pad)}" fill="${customization.bgColor}"/>
  <svg x="${pad}" y="${pad}" width="${qrAreaSize}" height="${qrH}" viewBox="0 0 ${size} ${size}" preserveAspectRatio="xMidYMid meet">
    <g fill="${fillValue}">${modulesSvg}</g>
    ${logoSvg}
  </svg>
  <text x="${size / 2}" y="${size - pad - textH * 0.3}" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="${textH * 0.55}" font-weight="700" fill="${frameColor}" letter-spacing="1">${frameText}</text>
</svg>`;
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 ${size} ${size}" shape-rendering="geometricPrecision" style="max-width:100%;height:auto;">
  ${fillDef}
  <rect width="${size}" height="${size}" fill="${customization.bgColor}"/>
  <g fill="${fillValue}">${modulesSvg}</g>
  ${logoSvg}
</svg>`;
  } catch {
    return "";
  }
}
