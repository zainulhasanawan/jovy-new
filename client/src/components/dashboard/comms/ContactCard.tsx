import { ChevronRight, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getVendorTypeConfig } from "@/utils/dashboard/comms-config";
import { StatusBadge } from "./CommsSharedUi";
import type { Contact } from "@/types/dashboard/comms";

type ContactCardProps = {
  contact: Contact;
  onClick: () => void;
};

export function ContactCard({ contact, onClick }: ContactCardProps) {
  const typeConfig = getVendorTypeConfig(contact.vendorType);
  const Icon = typeConfig.icon;

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
      data-testid={`contact-card-${contact.id}`}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <Icon className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-foreground truncate">
                {contact.vendorName}
              </h3>
              <StatusBadge status={contact.status || "researching"} />
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
              <span>{typeConfig.label}</span>
              {contact.location && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {contact.location}
                  </span>
                </>
              )}
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}
