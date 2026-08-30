"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { CommandPalette } from "@/components/qr/command-palette";
import { OnboardingTour } from "@/components/qr/onboarding-tour";
import { KeyboardShortcutsHelp } from "@/components/qr/keyboard-shortcuts-help";
import { useQrStore } from "@/store/qr-store";
import { QrCode, Heart, Loader2 } from "lucide-react";

// Lazy load views to reduce initial bundle size
// Only the active view is loaded, preventing memory issues
const GenerateView = dynamic(() => import("@/components/qr/generate-view").then(m => ({ default: m.GenerateView })), {
  loading: () => <ViewLoader />,
});
const DashboardView = dynamic(() => import("@/components/qr/dashboard-view").then(m => ({ default: m.DashboardView })), {
  loading: () => <ViewLoader />,
});
const ScannerView = dynamic(() => import("@/components/qr/scanner-view").then(m => ({ default: m.ScannerView })), {
  loading: () => <ViewLoader />,
});
const HistoryView = dynamic(() => import("@/components/qr/history-view").then(m => ({ default: m.HistoryView })), {
  loading: () => <ViewLoader />,
});
const FavoritesView = dynamic(() => import("@/components/qr/favorites-view").then(m => ({ default: m.FavoritesView })), {
  loading: () => <ViewLoader />,
});
const TemplatesView = dynamic(() => import("@/components/qr/templates-view").then(m => ({ default: m.TemplatesView })), {
  loading: () => <ViewLoader />,
});
const StatisticsView = dynamic(() => import("@/components/qr/statistics-view").then(m => ({ default: m.StatisticsView })), {
  loading: () => <ViewLoader />,
});
const SettingsView = dynamic(() => import("@/components/qr/settings-view").then(m => ({ default: m.SettingsView })), {
  loading: () => <ViewLoader />,
});
const BatchView = dynamic(() => import("@/components/qr/batch-view").then(m => ({ default: m.BatchView })), {
  loading: () => <ViewLoader />,
});
const CompareView = dynamic(() => import("@/components/qr/compare-view").then(m => ({ default: m.CompareView })), {
  loading: () => <ViewLoader />,
});

function ViewLoader() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Memuat...</p>
      </div>
    </div>
  );
}

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
      case "compare":
        return <CompareView />;
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
  const [shortcutsOpen, setShortcutsOpen] = React.useState(false);

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
                <button
                  onClick={() => setShortcutsOpen(true)}
                  className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono rounded border bg-muted text-muted-foreground hover:bg-accent transition-colors"
                  title="Keyboard shortcuts"
                >
                  ?
                </button>
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
      <KeyboardShortcutsHelp open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
    </div>
  );
}
