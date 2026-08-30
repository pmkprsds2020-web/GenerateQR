"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LayoutTemplate, ArrowRight, Plus, Trash2, Bookmark, Star } from "lucide-react";
import { useQrStore, BUILTIN_TEMPLATES } from "@/store/qr-store";
import { QR_TYPE_LABELS, QR_TYPE_ICONS } from "@/lib/qr/qr-types";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function TemplatesView() {
  const setActiveView = useQrStore((s) => s.setActiveView);
  const setSetType = useQrStore((s) => s.setSetType);
  const setEditingId = useQrStore((s) => s.setEditingId);
  const customTemplates = useQrStore((s) => s.customTemplates);
  const deleteCustomTemplate = useQrStore((s) => s.deleteCustomTemplate);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const handleSelect = (templateType: string) => {
    setEditingId(null);
    setSetType(templateType);
    setActiveView("generate");
    toast.info("Template dipilih, silakan isi data.");
  };

  const handleSelectCustom = (tplId: string) => {
    // For custom templates, we'd need to load the data. For now, just set the type.
    const tpl = customTemplates.find((t) => t.id === tplId);
    if (tpl) {
      setEditingId(null);
      setSetType(tpl.type);
      setActiveView("generate");
      toast.info(`Template "${tpl.name}" dipilih`);
    }
  };

  const handleDelete = (id: string) => {
    deleteCustomTemplate(id);
    toast.success("✓ Template dihapus");
    setDeleteId(null);
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-1">
          <LayoutTemplate className="h-5 w-5 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Template</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Template QR</h1>
        <p className="text-sm text-muted-foreground">
          Mulai cepat dengan template siap pakai atau simpan template kustom Anda
        </p>
      </motion.div>

      {/* Custom Templates */}
      {customTemplates.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Bookmark className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">Template Kustom Saya</h2>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {customTemplates.length}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {customTemplates.map((tpl, i) => (
              <motion.div
                key={tpl.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="overflow-hidden hover:shadow-md transition-all group cursor-pointer card-premium relative">
                  <button
                    onClick={() => setDeleteId(tpl.id)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-background/80 backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground z-10"
                    aria-label="Hapus template"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 text-2xl shrink-0 border border-primary/10">
                        {QR_TYPE_ICONS[tpl.type] || tpl.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">{tpl.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{QR_TYPE_LABELS[tpl.type]}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                        Kustom
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 text-xs group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                        onClick={() => handleSelectCustom(tpl.id)}
                      >
                        Gunakan
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Built-in Templates */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">Template Bawaan</h2>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {BUILTIN_TEMPLATES.length}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {BUILTIN_TEMPLATES.map((tpl, i) => (
            <motion.div
              key={tpl.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card className="overflow-hidden hover:shadow-md transition-all group cursor-pointer card-premium">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 text-2xl shrink-0 border border-primary/10 group-hover:scale-110 transition-transform">
                      {tpl.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm">{tpl.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{tpl.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                      {QR_TYPE_LABELS[tpl.type]}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 text-xs group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                      onClick={() => handleSelect(tpl.type)}
                    >
                      Gunakan
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Template Kustom?</AlertDialogTitle>
            <AlertDialogDescription>
              Template kustom ini akan dihapus permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteId && handleDelete(deleteId)}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
