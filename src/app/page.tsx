"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { GenerateView } from "@/components/qr/generate-view";
import { DashboardView } from "@/components/qr/dashboard-view";
import { ScannerView } from "@/components/qr/scanner-view";
import { HistoryView } from "@/components/qr/history-view";
import { FavoritesView } from "@/components/qr/favorites-view";
import { TemplatesView } from "@/components/qr/templates-view";
import { StatisticsView } from "@/components/qr/statistics-view";
import { SettingsView } from "@/components/qr/settings-view";
import { BatchView } from "@/components/qr/batch-view";
import { CommandPalette } from "@/components/qr/command-palette";
import { OnboardingTour } from "@/components/qr/onboarding-tour";
import { useQrStore } from "@/store/qr-store";
import { QrCode, Heart } from "lucide-react";

function ViewRouter() {
  const activeView = useQrStore((s) => s.activeView);

  const renderView = () => {
    switch (activeView) {
      case "dashboard":
        return <DashboardView />;
      case "generate":
        return <GenerateView />;
      case "batch":
        return <BatchView />;
      case "scanner":
        return <ScannerView />;
      case "history":
        return <HistoryView />;
      case "favorites":
        return <FavoritesView />;
      case "templates":
        return <TemplatesView />;
      case "statistics":
        return <StatisticsView />;
      case "settings":
        return <SettingsView />;
      default:
        return <GenerateView />;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeView}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        {renderView()}
      </motion.div>
    </AnimatePresence>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex flex-1">
        <AppSidebar />
        <main className="flex-1 min-w-0 flex flex-col">
          <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <ViewRouter />
            </div>
          </div>
          <footer className="border-t mt-auto glass">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-sm">
                  <QrCode className="h-3.5 w-3.5" />
                </div>
                <span className="font-medium">QR GEN PRO</span>
                <span className="hidden sm:inline">— QR Code Generator Gratis</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  Dibuat dengan
                  <Heart className="h-3 w-3 text-red-500 fill-red-500" />
                  menggunakan Next.js
                </div>
                <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono rounded border bg-muted text-muted-foreground">
                  ⌘K
                </kbd>
              </div>
            </div>
          </footer>
        </main>
      </div>
      <CommandPalette />
      <OnboardingTour />
    </div>
  );
}
