import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Eye, Trash2, MessageSquare, Info } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import type { Quote } from "@/types/dashboard/schema";
import {
  getCategoryIconNode,
  getVendorCategoryName,
} from "../../../types/dashboard/categorization";
import { formatPrice } from "../../../types/dashboard/formatters";
import { getQuotePriceData } from "../../../types/dashboard/quote-utils";
import { calculatePerGuestAllInCost } from "@/utils/dashboard/utils";
import { VENDOR_TAXONOMY } from "@/utils/dashboard/vendor-taxonomy";

function getVendorCategoryNameLocal(categoryId: string): string {
  return getVendorCategoryName(
    categoryId,
    VENDOR_TAXONOMY as Record<string, { name?: string }>,
  );
}

interface ExternalVendorQuoteCardProps {
  quote: Quote;
  guestCount: number;
  hasContact: boolean;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ExternalVendorQuoteCard({
  quote,
  guestCount,
  hasContact,
  onView,
  onDelete,
}: ExternalVendorQuoteCardProps) {
  const categoryName = quote.vendorCategory
    ? getVendorCategoryNameLocal(quote.vendorCategory)
    : "Vendor";
  const serviceCount = (quote.inclusions || []).length;

  const { amount, currency, guestPricing, mandatoryFees } = getQuotePriceData(
    quote,
    guestCount,
  );

  const hasGuestPricing = !!guestPricing;
  const hasMandatoryFees = mandatoryFees.length > 0;
  const additionalPrice = guestPricing
    ? (guestPricing.additionalGuestPriceWithFees ??
      guestPricing.additionalGuestPrice)
    : null;

  const perGuestCost = calculatePerGuestAllInCost(
    {
      guestPricing: guestPricing || undefined,
      mandatoryFees: mandatoryFees || [],
      accommodationDetails: quote.accommodationDetails,
      currency,
      totalPrice: quote.totalPrice,
    },
    guestCount,
  );

  return (
    <div
      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
      data-testid={`quote-item-${quote.id}`}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-[#D4847A]/10 flex items-center justify-center flex-shrink-0">
          {getCategoryIconNode(
            quote.vendorCategory || "",
            "w-5 h-5 text-[#D4847A]",
          )}
        </div>
        <div>
          <p className="font-medium">
            {quote.vendorName || quote.packageName || "Unnamed Vendor"}
          </p>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {categoryName}
            </Badge>
            {serviceCount > 0 && (
              <span className="text-xs text-muted-foreground">
                {serviceCount} service{serviceCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex flex-col items-end gap-0.5">
          <span className="font-semibold text-[#D4847A]">
            {formatPrice(amount, currency)}
          </span>
          {perGuestCost && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">
                {perGuestCost.min === perGuestCost.max
                  ? formatPrice(perGuestCost.min, perGuestCost.currency)
                  : `${formatPrice(perGuestCost.min, perGuestCost.currency)} - ${formatPrice(perGuestCost.max, perGuestCost.currency)}`}{" "}
                per guest
              </span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs mb-1">
                      <strong>Per-guest all-in cost</strong>
                    </p>
                    <p className="text-xs">
                      Includes package
                      {mandatoryFees.length > 0 &&
                        ` + ${mandatoryFees.map((f) => f.label).join(", ")}`}
                      {perGuestCost.breakdown.accommodation &&
                        ` + accommodation`}
                    </p>
                    <p className="text-xs mt-1 text-muted-foreground">
                      Based on {guestCount} guests
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
          {hasGuestPricing && (
            <span className="text-xs text-muted-foreground">
              Includes {guestPricing!.baseGuestCount.toLocaleString()} guests
            </span>
          )}
          {hasGuestPricing && additionalPrice && (
            <span className="text-xs text-muted-foreground">
              +{formatPrice(additionalPrice, currency)} per extra guest
            </span>
          )}
          {!hasGuestPricing && hasMandatoryFees && (
            <Badge
              variant="secondary"
              className="text-[10px] bg-[#C4918A]/10 text-[#9B6B6B] border-[#C4918A]/40"
            >
              Fees apply
            </Badge>
          )}
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
