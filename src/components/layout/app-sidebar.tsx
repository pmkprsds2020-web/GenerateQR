"use client";

import * as React from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  QrCode,
  ScanLine,
  History,
  Star,
  LayoutTemplate,
  BarChart3,
  Settings,
  Moon,
  Sun,
  Menu,
  Github,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useQrStore } from "@/store/qr-store";

export interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "generate", label: "Generate QR", icon: QrCode },
  { id: "scanner", label: "Scanner", icon: ScanLine },
  { id: "history", label: "Riwayat", icon: History },
  { id: "favorites", label: "Favorit", icon: Star },
  { id: "templates", label: "Template", icon: LayoutTemplate },
  { id: "statistics", label: "Statistik", icon: BarChart3 },
  { id: "settings", label: "Pengaturan", icon: Settings },
];

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-9 w-9" />;
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Ganti tema"
      className="h-9 w-9"
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const activeView = useQrStore((s) => s.activeView);
  const setActiveView = useQrStore((s) => s.setActiveView);
  const records = useQrStore((s) => s.records);
  const favoritesCount = records.filter((r) => r.favorite).length;

  const handleClick = (id: string) => {
    setActiveView(id);
    onNavigate?.();
  };

  return (
    <nav className="flex flex-col gap-1 px-3 py-2" aria-label="Navigasi utama">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = activeView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => handleClick(item.id)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all relative group",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
            aria-current={active ? "page" : undefined}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-left">{item.label}</span>
            {item.id === "favorites" && favoritesCount > 0 && (
              <span
                className={cn(
                  "text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center",
                  active ? "bg-primary-foreground/20 text-primary-foreground" : "bg-accent text-accent-foreground"
                )}
              >
                {favoritesCount}
              </span>
            )}
            {item.id === "history" && records.length > 0 && (
              <span
                className={cn(
                  "text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center",
                  active ? "bg-primary-foreground/20 text-primary-foreground" : "bg-accent text-accent-foreground"
                )}
              >
                {records.length}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

function SidebarHeader() {
  return (
    <div className="flex items-center gap-2.5 px-5 py-5 border-b">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shrink-0">
        <QrCode className="h-5 w-5" />
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-base font-bold tracking-tight">QR GEN PRO</span>
        <span className="text-[11px] text-muted-foreground">QR Code Generator</span>
      </div>
    </div>
  );
}

function SidebarFooter() {
  return (
    <div className="mt-auto border-t p-3 flex items-center justify-between gap-2">
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <Button variant="ghost" size="icon" asChild className="h-9 w-9" aria-label="GitHub">
          <Link href="https://github.com" target="_blank" rel="noreferrer">
            <Github className="h-4 w-4" />
          </Link>
        </Button>
      </div>
      <span className="text-[11px] text-muted-foreground">v1.0.0</span>
    </div>
  );
}

export function AppSidebar() {
  return (
    <>
      <aside className="w-[260px] shrink-0 hidden md:flex flex-col h-screen sticky top-0 bg-sidebar border-r">
        <SidebarHeader />
        <div className="flex-1 overflow-y-auto py-2">
          <NavLinks />
        </div>
        <SidebarFooter />
      </aside>
      <MobileSidebar />
    </>
  );
}

function MobileSidebar() {
  const [open, setOpen] = React.useState(false);
  const activeView = useQrStore((s) => s.activeView);

  return (
    <div className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-background/95 backdrop-blur border-b">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <QrCode className="h-4 w-4" />
        </div>
        <span className="text-sm font-bold">QR GEN PRO</span>
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Buka menu">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] p-0 flex flex-col">
          <SheetTitle className="sr-only">Menu Navigasi</SheetTitle>
          <SidebarHeader />
          <div className="flex-1 overflow-y-auto py-2">
            <NavLinks onNavigate={() => setOpen(false)} />
          </div>
          <SidebarFooter />
        </SheetContent>
      </Sheet>
    </div>
  );
}
