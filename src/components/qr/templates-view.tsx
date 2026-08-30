"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LayoutTemplate, ArrowRight } from "lucide-react";
import { useQrStore, BUILTIN_TEMPLATES } from "@/store/qr-store";
import { QR_TYPE_LABELS } from "@/lib/qr/qr-types";
import { toast } from "sonner";

export function TemplatesView() {
  const setActiveView = useQrStore((s) => s.setActiveView);
  const setSetType = useQrStore((s) => s.setSetType);
  const setEditingId = useQrStore((s) => s.setEditingId);

  const handleSelect = (templateType: string) => {
    setEditingId(null);
    setSetType(templateType);
    setActiveView("generate");
    toast.info("Template dipilih, silakan isi data.");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <LayoutTemplate className="h-6 w-6" />
          Template QR
        </h1>
        <p className="text-sm text-muted-foreground">
          Mulai cepat dengan template siap pakai
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {BUILTIN_TEMPLATES.map((tpl) => (
          <Card key={tpl.id} className="overflow-hidden hover:shadow-md transition-all group cursor-pointer" >
            <CardContent className="p-5">
              <div className="flex items-start gap-3 mb-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-2xl shrink-0">
                  {tpl.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm">{tpl.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{tpl.description}</p>
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
        ))}
      </div>
    </div>
  );
}
