import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUS_CONFIG } from "@/utils/dashboard/comms-config";

export function CommsCenterSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-10 w-[140px]" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-[140px]" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-10 w-[120px]" />
        </div>
      </div>

      <section className="space-y-3">
        <Skeleton className="h-4 w-48" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-5 w-24 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-56" />
                  </div>
                  <Skeleton className="h-5 w-5 shrink-0" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <Skeleton className="h-4 w-36" />
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-48" />
                  </div>
                  <Skeleton className="h-5 w-5 shrink-0" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.researching;
  return (
    <Badge
      variant="outline"
      className={cn("font-medium border-0", config.bgColor, config.color)}
    >
      {config.label}
    </Badge>
  );
}

export function CommsEmptyState({
  onAddContact,
}: {
  onAddContact: () => void;
}) {
  return (
    <EmptyState
      icon={<MessageSquare className="w-7 h-7 text-[#D4847A]" />}
      title="Start Your Vendor Conversations"
      subtitle="Reach out to venues and vendors to get information and quotes. We'll help you create professional, personalized messages based on your wedding details."
      primaryAction={{
        label: "New Outreach",
        onClick: onAddContact,
        icon: <Plus className="w-4 h-4 mr-2" />,
      }}
      helperText="Search for venues by name or paste their website URL"
    />
  );
}
