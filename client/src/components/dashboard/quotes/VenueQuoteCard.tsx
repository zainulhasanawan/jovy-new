import { Button } from "@/components/ui/button";
import { Eye, Trash2, MapPin, MessageSquare } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import type { Quote } from "@/types/dashboard/schema";
import { CategoryCoveragePills } from "./CategoryCoveragePills";
import { formatPrice } from "../../../types/dashboard/formatters";
import { getQuotePriceData } from "../../../types/dashboard/quote-utils";

interface VenueQuoteCardProps {
  quote: Quote;
  guestCount: number;
  combinedCoverage: string[];
  hasContact: boolean;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
}

export function VenueQuoteCard({
  quote,
  guestCount,
  combinedCoverage,
  hasContact,
  onView,
  onDelete,
}: VenueQuoteCardProps) {
  const { amount, currency } = getQuotePriceData(quote, guestCount);

  const projectedTotalCost =
    quote.projectedTotalCost != null
      ? typeof quote.projectedTotalCost === "string"
        ? parseFloat(quote.projectedTotalCost)
        : quote.projectedTotalCost
      : null;

  const locationStr =
    quote.venue?.city || quote.venue?.country
      ? `${quote.venue?.city ?? ""}${quote.venue?.city && quote.venue?.country ? ", " : ""}${quote.venue?.country ?? ""}`
      : "Location TBD";

  return (
    <div
      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
      data-testid={`quote-item-${quote.id}`}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-[#E07A5F]/10 flex items-center justify-center flex-shrink-0">
          <MapPin className="w-5 h-5 text-[#E07A5F]" />
        </div>
        <div>
          <p className="font-medium">
            {quote.vendorName || quote.packageName || "Unnamed Venue"}
          </p>
          <p className="text-sm text-muted-foreground">{locationStr}</p>
          <CategoryCoveragePills covered={combinedCoverage} />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex flex-col items-end gap-0.5 mt-0.5 w-full">
          <span className="text-xs text-muted-foreground">Quoted Cost</span>
          <span className="text-sm font-semibold text-[#D4847A]">
            ~{formatPrice(amount, currency)}
          </span>
          <span className="text-xs text-muted-foreground">Projected Cost</span>
          <span className="text-sm font-semibold text-[#C4918A]">
            ~{formatPrice(projectedTotalCost, currency)}
          </span>
        </div>
        <div className="flex gap-1">
          {hasContact && (
            <RouterLink
              to={`/dashboard/comms?vendor=${encodeURIComponent(quote.vendorName || "")}&quoteId=${quote.id}`}
            >
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                title="View communications"
                data-testid={`comms-quote-${quote.id}`}
              >
                <MessageSquare className="w-4 h-4" />
              </Button>
            </RouterLink>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onView(quote.id!)}
            data-testid={`view-quote-${quote.id}`}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            onClick={() => onDelete(quote.id!)}
            data-testid={`delete-quote-${quote.id}`}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
