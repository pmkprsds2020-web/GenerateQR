"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function QrCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex justify-center bg-muted/30 rounded-xl p-4 mb-3">
          <Skeleton className="h-[180px] w-[180px] rounded-lg" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <Skeleton className="h-5 w-20 rounded-full" />
          <div className="flex gap-1 pt-1">
            <Skeleton className="h-8 flex-1 rounded" />
            <Skeleton className="h-8 flex-1 rounded" />
            <Skeleton className="h-8 flex-1 rounded" />
            <Skeleton className="h-8 flex-1 rounded" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function QrListSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-14 w-14 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-2/3" />
              </div>
              <div className="flex gap-1 shrink-0">
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function StatsCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
          <Skeleton className="h-10 w-10 rounded-xl" />
        </div>
      </CardContent>
    </Card>
  );
}
