"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: "default" | "search" | "favorite" | "history";
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  variant = "default",
}: EmptyStateProps) {
  const gradients: Record<string, string> = {
    default: "from-primary/10 to-primary/5 border-primary/10",
    search: "from-sky-500/10 to-sky-500/5 border-sky-500/10",
    favorite: "from-amber-500/10 to-amber-500/5 border-amber-500/10",
    history: "from-violet-500/10 to-violet-500/5 border-violet-500/10",
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative mb-5"
      >
        <div className={`flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br ${gradients[variant]} border`}>
          <Icon className="h-10 w-10 text-primary/50" />
        </div>
        {/* Decorative dashed ring */}
        <div className="absolute -inset-4 border-2 border-dashed border-primary/10 rounded-[2rem] animate-pulse-soft" />
        {/* Floating dots */}
        <div className="absolute -top-2 -right-2 h-3 w-3 rounded-full bg-primary/20 animate-pulse" style={{ animationDelay: "0.5s" }} />
        <div className="absolute -bottom-1 -left-3 h-2 w-2 rounded-full bg-primary/15 animate-pulse" style={{ animationDelay: "1s" }} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-base font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">{description}</p>
        {actionLabel && onAction && (
          <Button size="sm" className="mt-5 shadow-sm" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </motion.div>
    </div>
  );
}
