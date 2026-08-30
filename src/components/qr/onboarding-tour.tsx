"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, ChevronLeft, ChevronRight, Check, Sparkles, QrCode, ScanLine, Download, Star } from "lucide-react";
import { useQrStore } from "@/store/qr-store";

const TOUR_STORAGE_KEY = "qr-gen-pro-tour-completed";

const TOUR_STEPS = [
  {
    icon: Sparkles,
    title: "Selamat Datang di QR GEN PRO",
    description: "Aplikasi QR Code Generator gratis dan modern. Buat QR Code untuk berbagai kebutuhan hanya dalam beberapa detik.",
    color: "from-emerald-500 to-teal-600",
  },
  {
    icon: QrCode,
    title: "Buat QR Code",
    description: "Pilih dari 12 jenis QR Code: URL, WhatsApp, WiFi, vCard, Email, Lokasi, dan lainnya. Preview real-time langsung muncul saat Anda mengetik.",
    color: "from-sky-500 to-blue-600",
  },
  {
    icon: Download,
    title: "Download & Kustomisasi",
    description: "Download dalam format PNG, JPG, SVG, atau PDF. Kustomisasi warna, gradient, logo, dan bingkai sesuai brand Anda.",
    color: "from-violet-500 to-purple-600",
  },
  {
    icon: ScanLine,
    title: "Scan QR Code",
    description: "Gunakan kamera atau upload gambar untuk memindai QR Code. Hasil scan langsung ditampilkan dengan tombol aksi cepat.",
    color: "from-amber-500 to-orange-600",
  },
  {
    icon: Star,
    title: "Kelola & Favorit",
    description: "Simpan QR Code ke riwayat, tandai favorit, gunakan template, dan lihat statistik. Semua data tersimpan lokal di browser Anda.",
    color: "from-pink-500 to-rose-600",
  },
];

export function OnboardingTour() {
  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState(0);
  const setActiveView = useQrStore((s) => s.setActiveView);

  React.useEffect(() => {
    const completed = localStorage.getItem(TOUR_STORAGE_KEY);
    if (!completed) {
      const timer = setTimeout(() => setOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(TOUR_STORAGE_KEY, "true");
    setOpen(false);
  };

  const handleNext = () => {
    if (step < TOUR_STEPS.length - 1) {
      setStep(step + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSkip = () => {
    handleClose();
  };

  const current = TOUR_STEPS[step];
  const Icon = current.icon;
  const isLast = step === TOUR_STEPS.length - 1;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.4 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md"
          >
            <Card className="overflow-hidden shadow-2xl border-0">
              <CardContent className="p-0">
                {/* Header with gradient */}
                <div className={`relative bg-gradient-to-br ${current.color} p-8 text-white`}>
                  <button
                    onClick={handleSkip}
                    className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                    aria-label="Lewati"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="flex justify-center mb-3">
                    <motion.div
                      key={step}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", duration: 0.5 }}
                      className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm"
                    >
                      <Icon className="h-8 w-8" />
                    </motion.div>
                  </div>
                  <h2 className="text-xl font-bold text-center">{current.title}</h2>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                  <p className="text-sm text-muted-foreground text-center leading-relaxed">
                    {current.description}
                  </p>

                  {/* Progress dots */}
                  <div className="flex items-center justify-center gap-1.5">
                    {TOUR_STEPS.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setStep(i)}
                        className={`h-1.5 rounded-full transition-all ${
                          i === step ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"
                        }`}
                        aria-label={`Langkah ${i + 1}`}
                      />
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between gap-2 pt-2">
                    <Button variant="ghost" size="sm" onClick={handleSkip}>
                      Lewati
                    </Button>
                    <div className="flex gap-2">
                      {step > 0 && (
                        <Button variant="outline" size="sm" onClick={handlePrev}>
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Kembali
                        </Button>
                      )}
                      <Button size="sm" onClick={handleNext}>
                        {isLast ? (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            Mulai
                          </>
                        ) : (
                          <>
                            Lanjut
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Step counter */}
                  <p className="text-center text-xs text-muted-foreground">
                    {step + 1} dari {TOUR_STEPS.length}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
