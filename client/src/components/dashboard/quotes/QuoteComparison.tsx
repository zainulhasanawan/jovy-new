import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  AlertTriangle,
  FileText,
  MapPin,
  Plus,
  GitCompare,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Quote, User, WeddingOption } from "@/types/dashboard/schema";
import { getVendorCategoryCoverage } from "@/utils/dashboard/coverage-utils";
import type { VendorCategoryType } from "@/types/dashboard/vendor-taxonomy";
import { EmptyState } from "@/components/EmptyState";
import { VenueQuoteCard } from "./VenueQuoteCard";
import { ExternalVendorQuoteCard } from "./ExternalVendorQuoteCard";
import { QuoteDetailModal } from "./QuoteDetailModal";
import { QuoteCompareModal } from "./QuoteCompareModal";
import type { ContactLike } from "../../../types/dashboard/quote-types";

interface QuoteComparisonProps {
  quotes: Quote[];
  userId: string;
  onAddQuote?: () => void;
  onTabChange?: (tab: string) => void;
  guestCount?: number;
}

export function QuoteComparison({
  quotes,
  userId,
  onAddQuote,
  onTabChange,
  guestCount = 120,
}: QuoteComparisonProps) {
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);
  const [deleteConfirmQuoteId, setDeleteConfirmQuoteId] = useState<
    string | null
  >(null);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: contacts = [] } = useQuery<ContactLike[]>({
    queryKey: ["/api/contacts", userId],
    enabled: !!userId,
  });

  const { data: user } = useQuery<User>({
    queryKey: ["/api/users", userId],
    enabled: !!userId,
  });

  const { data: weddingOptions = [] } = useQuery<WeddingOption[]>({
    queryKey: ["/api/wedding-options/user", userId],
    enabled: !!userId,
  });

  const confirmedQuotes = quotes.filter(
    (q) => (q.reviewStatus as string) === "confirmed",
  );
  const venueQuotes = confirmedQuotes.filter((q) => q.quoteType === "venue");
  const externalVendorQuotes = confirmedQuotes.filter(
    (q) => String(q.quoteType) === "external_vendor",
  );
  const selectedQuote = selectedQuoteId
    ? confirmedQuotes.find((q) => q.id === selectedQuoteId)
    : null;

  const hasContactForVendor = (
    vendorName: string | null | undefined,
  ): boolean => {
    if (!vendorName) return false;
    const normalized = vendorName.toLowerCase().trim();
    return contacts.some(
      (c) => c.vendorName?.toLowerCase().trim() === normalized,
    );
  };

  const getCombinedCoverage = (venueQuote: Quote) => {
    const matchingOption = weddingOptions.find(
      (o) => o.baseVenueQuoteId === venueQuote.id,
    );
    const attachedIds =
      (matchingOption?.attachedVendorQuoteIds as string[]) || [];
    const selectedMenuIds =
      (matchingOption?.selectedMenuOptionIds as string[]) ||
      (venueQuote.selectedMenuOptionIds as string[]) ||
      [];
    const results = getVendorCategoryCoverage({
      venueQuote,
      attachedVendorQuoteIds: attachedIds,
      allQuotes: confirmedQuotes,
      selectedMenuOptionIds: selectedMenuIds,
    });
    return results
      .filter((r) => r.status !== "needed")
      .map((r) => r.categoryId as VendorCategoryType);
  };

  const deleteQuoteMutation = useMutation({
    mutationFn: async (quoteId: string) => {
      const response = await apiRequest("DELETE", `/api/quotes/${quoteId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quotes/user", userId] });
      queryClient.invalidateQueries({
        queryKey: ["/api/wedding-options/user", userId],
      });
      setDeleteConfirmQuoteId(null);
      toast({
        title: "Quote deleted",
        description: "The quote has been removed.",
      });
    },
    onError: () => {
      toast({
        title: "Delete failed",
        description: "Could not delete the quote. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (confirmedQuotes.length === 0) {
    return (
      <EmptyState
        icon={<FileText className="w-7 h-7 text-[#D4847A]" />}
        title="No Quotes Yet"
        subtitle="Upload quotes you've received from venues and vendors. Our AI will analyze them and organize everything for easy comparison."
        primaryAction={
          onAddQuote
            ? {
                label: "Upload Quote",
                onClick: onAddQuote,
                icon: <Plus className="w-4 h-4 mr-2" />,
              }
            : undefined
        }
        secondaryAction={
          onTabChange
            ? {
                label: "Still gathering quotes? Start with vendor outreach →",
                onClick: () => onTabChange("comms"),
              }
            : undefined
        }
        helperText="Supports PDFs, images, and pasted text"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-semibold">Your Quotes</h2>
          <p className="text-sm text-muted-foreground">
            {confirmedQuotes.length} quote
            {confirmedQuotes.length !== 1 ? "s" : ""} uploaded
          </p>
        </div>
      </div>

      {venueQuotes.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#E07A5F]" />
                Venues ({venueQuotes.length})
              </CardTitle>
              {venueQuotes.length >= 2 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCompareModal(true)}
                  className="flex items-center gap-2"
                >
                  <GitCompare className="w-4 h-4" />
                  Compare Quotes
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {venueQuotes.map((quote) => (
                <VenueQuoteCard
                  key={quote.id}
                  quote={quote}
                  guestCount={guestCount}
                  combinedCoverage={getCombinedCoverage(quote)}
                  hasContact={hasContactForVendor(quote.vendorName)}
                  onView={setSelectedQuoteId}
                  onDelete={setDeleteConfirmQuoteId}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {externalVendorQuotes.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#D4847A]" />
              External Vendors ({externalVendorQuotes.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {externalVendorQuotes.map((quote) => (
                <ExternalVendorQuoteCard
                  key={quote.id}
                  quote={quote}
                  guestCount={guestCount}
                  hasContact={hasContactForVendor(quote.vendorName)}
                  onView={setSelectedQuoteId}
                  onDelete={setDeleteConfirmQuoteId}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {showCompareModal && (
        <QuoteCompareModal
          open={showCompareModal}
          onOpenChange={setShowCompareModal}
          venueQuotes={venueQuotes}
          confirmedQuotes={confirmedQuotes}
          weddingOptions={weddingOptions}
          user={user}
          guestCount={guestCount}
        />
      )}

      {selectedQuote && (
        <QuoteDetailModal
          quote={selectedQuote}
          open={!!selectedQuoteId}
          onClose={() => setSelectedQuoteId(null)}
          guestCount={guestCount}
          userId={userId}
        />
      )}

      <AlertDialog
        open={!!deleteConfirmQuoteId}
        onOpenChange={() => setDeleteConfirmQuoteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#D4847A]" />
              Delete this quote?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {(() => {
                const quoteToDelete = confirmedQuotes.find(
                  (q) => q.id === deleteConfirmQuoteId,
                );
                const quoteName =
                  quoteToDelete?.vendorName ||
                  quoteToDelete?.packageName ||
                  "This quote";
                return (
                  <>
                    <span className="font-medium text-foreground">
                      {quoteName}
                    </span>{" "}
                    will be removed from your options. This cannot be undone.
                  </>
                );
              })()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() =>
                deleteConfirmQuoteId &&
                deleteQuoteMutation.mutate(deleteConfirmQuoteId)
              }
              data-testid="confirm-delete-quote-btn"
            >
              Delete Quote
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
