"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Keyboard, Command, Search, Moon, Plus, Download } from "lucide-react";

interface KeyboardShortcutsHelpProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SHORTCUTS = [
  {
    group: "Navigasi",
    items: [
      { keys: ["⌘", "K"], description: "Buka Command Palette", icon: Command },
      { keys: ["⌘", "J"], description: "Ganti tema (gelap/terang)", icon: Moon },
      { keys: ["?"], description: "Tampilkan bantuan shortcut", icon: Keyboard },
    ],
  },
  {
    group: "QR Code",
    items: [
      { keys: ["⌘", "S"], description: "Simpan QR Code ke riwayat", icon: Plus },
      { keys: ["⌘", "D"], description: "Download QR Code", icon: Download },
      { keys: ["⌘", "F"], description: "Fokus ke pencarian (di Riwayat)", icon: Search },
    ],
  },
];

export function KeyboardShortcutsHelp({ open, onOpenChange }: KeyboardShortcutsHelpProps) {
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
        const target = e.target as HTMLElement;
        if (target.tagName !== "INPUT" && target.tagName !== "TEXTAREA") {
          e.preventDefault();
          onOpenChange(!open);
        }
      }
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-primary" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Gunakan shortcut keyboard untuk navigasi dan aksi cepat
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {SHORTCUTS.map((group) => (
            <div key={group.group} className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {group.group}
              </h3>
              <div className="space-y-1">
                {group.items.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{item.description}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {item.keys.map((key, j) => (
                          <kbd
                            key={j}
                            className="min-w-[28px] h-7 flex items-center justify-center px-2 text-xs font-mono font-semibold rounded-md border bg-muted shadow-sm"
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
