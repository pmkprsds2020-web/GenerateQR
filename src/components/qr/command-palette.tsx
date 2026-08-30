"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
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
  Plus,
  Download,
  Search,
  Layers,
} from "lucide-react";
import { useQrStore } from "@/store/qr-store";
import { useTheme } from "next-themes";
import type { QrType } from "@/lib/qr/qr-types";
import { QR_TYPE_LABELS, QR_TYPE_ICONS } from "@/lib/qr/qr-types";
import { toast } from "sonner";

const NAV_COMMANDS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, group: "Navigasi" },
  { id: "generate", label: "Generate QR", icon: QrCode, group: "Navigasi" },
  { id: "batch", label: "Batch Generator", icon: Layers, group: "Navigasi" },
  { id: "scanner", label: "Scanner", icon: ScanLine, group: "Navigasi" },
  { id: "history", label: "Riwayat", icon: History, group: "Navigasi" },
  { id: "favorites", label: "Favorit", icon: Star, group: "Navigasi" },
  { id: "templates", label: "Template", icon: LayoutTemplate, group: "Navigasi" },
  { id: "statistics", label: "Statistik", icon: BarChart3, group: "Navigasi" },
  { id: "settings", label: "Pengaturan", icon: Settings, group: "Navigasi" },
];

const QR_TYPES: QrType[] = ["url", "text", "phone", "whatsapp", "email", "sms", "wifi", "vcard", "location", "event", "payment", "custom"];

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const setActiveView = useQrStore((s) => s.setActiveView);
  const setEditingId = useQrStore((s) => s.setEditingId);
  const setSetType = useQrStore((s) => s.setSetType);
  const { theme, setTheme } = useTheme();

  // Keyboard shortcut Cmd+K / Ctrl+K
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      // Quick theme toggle: Cmd+J / Ctrl+J
      if ((e.metaKey || e.ctrlKey) && e.key === "j") {
        e.preventDefault();
        setTheme(theme === "dark" ? "light" : "dark");
        toast.success(theme === "dark" ? "Mode terang aktif" : "Mode gelap aktif");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [theme, setTheme]);

  const runCommand = (cmd: () => void) => {
    setOpen(false);
    setTimeout(cmd, 50);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden p-0 shadow-xl max-w-2xl" >
          <DialogTitle className="sr-only">Command Palette</DialogTitle>
          <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-2.5 [&_[cmdk-item]_svg]:h-4 [&_[cmdk-item]_svg]:w-4">
            <CommandInput placeholder="Cari perintah atau buat QR..." />
            <CommandList className="max-h-[400px]">
              <CommandEmpty>Tidak ada hasil ditemukan.</CommandEmpty>

              <CommandGroup heading="Navigasi Cepat">
                {NAV_COMMANDS.map((cmd) => {
                  const Icon = cmd.icon;
                  return (
                    <CommandItem
                      key={cmd.id}
                      value={`${cmd.label} ${cmd.group}`}
                      onSelect={() => runCommand(() => setActiveView(cmd.id))}
                      className="cursor-pointer"
                    >
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span>{cmd.label}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>

              <CommandSeparator />

              <CommandGroup heading="Buat QR Code">
                {QR_TYPES.map((type) => (
                  <CommandItem
                    key={type}
                    value={`qr ${QR_TYPE_LABELS[type]} ${type}`}
                    onSelect={() => runCommand(() => {
                      setEditingId(null);
                      setSetType(type);
                      setActiveView("generate");
                    })}
                    className="cursor-pointer"
                  >
                    <span className="text-base mr-1">{QR_TYPE_ICONS[type]}</span>
                    <span>{QR_TYPE_LABELS[type]}</span>
                  </CommandItem>
                ))}
              </CommandGroup>

              <CommandSeparator />

              <CommandGroup heading="Aksi">
                <CommandItem
                  value="toggle tema gelap terang"
                  onSelect={() => runCommand(() => {
                    setTheme(theme === "dark" ? "light" : "dark");
                    toast.success(theme === "dark" ? "Mode terang aktif" : "Mode gelap aktif");
                  })}
                  className="cursor-pointer"
                >
                  {theme === "dark" ? (
                    <>
                      <Sun className="h-4 w-4 text-muted-foreground" />
                      <span>Mode Terang</span>
                    </>
                  ) : (
                    <>
                      <Moon className="h-4 w-4 text-muted-foreground" />
                      <span>Mode Gelap</span>
                    </>
                  )}
                  <kbd className="ml-auto text-[10px] font-mono text-muted-foreground">⌘J</kbd>
                </CommandItem>
                <CommandItem
                  value="qr baru buat baru"
                  onSelect={() => runCommand(() => {
                    setEditingId(null);
                    setActiveView("generate");
                    toast.info("Form QR baru siap diisi");
                  })}
                  className="cursor-pointer"
                >
                  <Plus className="h-4 w-4 text-muted-foreground" />
                  <span>QR Baru</span>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
