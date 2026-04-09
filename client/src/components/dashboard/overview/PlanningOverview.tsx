import { useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/dashboard/currency";
import {
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  Clock,
  DollarSign,
  FileText,
  MapPin,
  MessageSquare,
  Pencil,
  Target,
  Users,
  CheckSquare,
} from "lucide-react";
import type { Quote, User, WeddingOption } from "@/types/dashboard/schema";
import {
  getEventAwareCoverage,
  getVendorCategoryCoverage,
} from "@/utils/dashboard/coverage-utils";
import {
  VENDOR_CATEGORY_IDS,
  VENDOR_TAXONOMY,
  inferVendorCategoryFromQuote,
} from "@/utils/dashboard/vendor-taxonomy";
import type { VendorCategoryType } from "@/types/dashboard/vendor-taxonomy";

export function PlanningOverview({
  user,
  quotes,
  savedPackages,
  weddingOptions,
  onTabChange,
}: {
  user: User | null;
  quotes: Quote[];
  savedPackages: unknown[];
  weddingOptions: WeddingOption[];
  onTabChange: (tab: string) => void;
}) {
  void savedPackages;

  // Both timeline and activity collapsed by default
  // Wedding profile data
  const weddingProfile = user?.weddingProfile;
  const coupleName = weddingProfile?.coupleNames || "Your Wedding";
  const weddingDateStr = weddingProfile?.timeline?.weddingDate;
  const weddingDate = weddingDateStr ? new Date(weddingDateStr) : null;
  const totalBudget = weddingProfile?.budget?.totalBudget || 0;
  const guestCount = weddingProfile?.guestInfo?.estimatedCount || 0;
  const currencyCode = weddingProfile?.budget?.currency || "EUR";
  const planningStage = weddingProfile?.planningStage || "exploring";
  const locations = weddingProfile?.locations || [];

  // Calculate days until wedding
  const today = new Date();
  const daysUntilWedding = weddingDate
    ? Math.ceil(
        (weddingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      )
    : null;

  // Venue and option data
  const primaryOptionId = weddingProfile?.primaryOptionId;
  const primaryOption =
    weddingOptions.find((o) => o.id === primaryOptionId) || weddingOptions[0];
  const selectedVenueQuote = primaryOption
    ? quotes.find((q) => q.id === primaryOption.baseVenueQuoteId)
    : null;
  const selectedVenueName =
    selectedVenueQuote?.vendorName || primaryOption?.name;
  const hasVenueSelected = !!primaryOptionId && !!selectedVenueName;

  // Venue quotes available for comparison
  const venueQuotes = quotes.filter((q) => q.quoteType === "venue");
  const otherVendorQuotes = quotes.filter((q) => q.quoteType !== "venue");

  // Check for available quotes per category (not attached yet)
  const availableQuotesByCategory = useMemo(() => {
    const result: Record<string, { count: number; vendorName: string }> = {};
    for (const catId of VENDOR_CATEGORY_IDS) {
      const matchingQuotes = otherVendorQuotes.filter((q) => {
        const qCat = q.vendorCategory || inferVendorCategoryFromQuote(q);
        if (qCat === catId) return true;
        const pairs = q.coveredPairs;
        return !!pairs?.some((p) => p.category === catId);
      });
      if (matchingQuotes.length > 0) {
        result[catId] = {
          count: matchingQuotes.length,
          vendorName: matchingQuotes[0].vendorName || "",
        };
      }
    }
    return result;
  }, [otherVendorQuotes]);

  // T2 — All-quotes coverage: every uploaded quote counts (attached or not)
  const allQuoteCoveredCategories = useMemo(() => {
    const covered = new Set<string>();
    quotes.forEach((q) => {
      const cat = q.vendorCategory;
      if (cat && VENDOR_CATEGORY_IDS.includes(cat as VendorCategoryType))
        covered.add(cat);
      const alsoCovers =
        (q.alsoCoversCategories as Record<string, string[]>) || {};
      Object.keys(alsoCovers).forEach((c) => {
        if (VENDOR_CATEGORY_IDS.includes(c as VendorCategoryType))
          covered.add(c);
      });
      const pairs = q.coveredPairs;
      if (pairs)
        pairs.forEach((p) => {
          if (VENDOR_CATEGORY_IDS.includes(p.category as VendorCategoryType))
            covered.add(p.category);
        });
    });
    return covered;
  }, [quotes]);

  // T1/T2 — Event-aware coverage for post-selection widget (matches Compare page)
  const eventAwareCoverage = useMemo(() => {
    if (!hasVenueSelected || !selectedVenueQuote) return null;
    const sbe = (weddingProfile?.servicesByEvent || {}) as Record<
      string,
      VendorCategoryType[]
    >;
    const ads = (weddingProfile?.allDayServices || []) as VendorCategoryType[];
    const attachedIds = primaryOption?.attachedVendorQuoteIds || [];
    const relevantQuotes = [
      selectedVenueQuote,
      ...quotes.filter((q) => attachedIds.includes(q.id as string)),
    ];
    return getEventAwareCoverage({
      quotes: relevantQuotes,
      servicesByEvent: sbe,
      allDayServices: ads,
    });
  }, [
    hasVenueSelected,
    selectedVenueQuote,
    primaryOption,
    quotes,
    weddingProfile,
  ]);

  const eventAwareTotalPairs = eventAwareCoverage?.totalRequired ?? 0;
  const eventAwareGapsCount = eventAwareCoverage?.gaps.length ?? 0;
  const eventAwareCoveredCount = eventAwareTotalPairs - eventAwareGapsCount;
  const eventAwareCoveragePercentage =
    eventAwareTotalPairs > 0
      ? Math.round((eventAwareCoveredCount / eventAwareTotalPairs) * 100)
      : 0;
  if (eventAwareCoverage) {
    console.log("COVERAGE CHECK:", {
      source: "dashboard",
      covered: eventAwareCoveredCount,
      total: eventAwareTotalPairs,
      percentage: eventAwareCoveragePercentage,
    });
  }

  // Use vendor category coverage
  const vendorCoverage = useMemo(() => {
    if (!primaryOption) {
      return VENDOR_CATEGORY_IDS.map((catId) => {
        const taxonomy = VENDOR_TAXONOMY[catId];
        const available = availableQuotesByCategory[catId];
        return {
          categoryId: catId,
          categoryName: taxonomy?.name || catId,
          icon: taxonomy?.icon || "📋",
          status: "needed" as const,
          vendorName: "",
          estimatedCost: 2000,
          hasQuoteAvailable: !!available,
          availableQuoteCount: available?.count || 0,
          availableVendorName: available?.vendorName || "",
        };
      });
    }

    const coverage = getVendorCategoryCoverage({
      venueQuote: selectedVenueQuote,
      attachedVendorQuoteIds: primaryOption.attachedVendorQuoteIds || [],
      allQuotes: quotes,
    });
    return coverage.map((cat) => {
      const available = availableQuotesByCategory[cat.categoryId];
      return {
        categoryId: cat.categoryId,
        categoryName: cat.categoryName,
        icon: cat.icon,
        status: cat.status,
        vendorName: cat.bookedVendorName || "",
        estimatedCost: cat.status === "needed" ? 2000 : 0,
        hasQuoteAvailable: !!available && cat.status === "needed",
        availableQuoteCount: available?.count || 0,
        availableVendorName: available?.vendorName || "",
      };
    });
  }, [primaryOption, selectedVenueQuote, quotes, availableQuotesByCategory]);

  // Calculate vendor coverage stats
  const coveredCount = vendorCoverage.filter(
    (c) => c.status === "booked",
  ).length;
  const neededCount = vendorCoverage.filter(
    (c) => c.status === "needed",
  ).length;

  // Calculate budget - matching Options Builder / Budget tab logic
  const quotedTotal = useMemo(() => {
    if (!primaryOption) return 0;
    const venueBase = parseFloat(selectedVenueQuote?.totalPrice || "0");

    // Guest adjustment calculation
    let guestAdjustment = 0;
    if (selectedVenueQuote && guestCount > 0) {
      const baseCapacity = parseInt(selectedVenueQuote.baseCapacity || "0");
      const perPersonPrice = parseFloat(
        selectedVenueQuote.perPersonPrice || "0",
      );
      if (baseCapacity > 0 && perPersonPrice > 0 && guestCount > baseCapacity) {
        guestAdjustment = (guestCount - baseCapacity) * perPersonPrice;
      }
    }

    // Add-ons total
    const addOns = (primaryOption.selectedAddOnQuoteIds || []).reduce(
      (sum: number, id: string) => {
        const addon = quotes.find((q) => q.id === id);
        return sum + parseFloat(addon?.totalPrice || "0");
      },
      0,
    );

    // Attached vendors total
    const attachedVendorIds = primaryOption.attachedVendorQuoteIds || [];
    const validAttachedVendors = attachedVendorIds
      .map((id: string) => quotes.find((q) => q.id === id))
      .filter((vendor): vendor is Quote => Boolean(vendor));
    const vendors = validAttachedVendors.reduce(
      (sum: number, vendor: Quote) => {
        return sum + parseFloat(vendor?.totalPrice || "0");
      },
      0,
    );

    // Outside vendor fee only applies when we have actual valid vendors attached
    const outsideVendorFee =
      validAttachedVendors.length > 0
        ? parseFloat(selectedVenueQuote?.outsideVendorFee || "0")
        : 0;

    return venueBase + guestAdjustment + addOns + vendors + outsideVendorFee;
  }, [primaryOption, selectedVenueQuote, quotes, guestCount]);

  const estimatedTotal = quotedTotal + neededCount * 2000;
  const remainingBudget = totalBudget - quotedTotal;
  const budgetPercentage =
    totalBudget > 0 ? Math.round((quotedTotal / totalBudget) * 100) : 0;
  const isOverBudget = estimatedTotal > totalBudget;

  // Currency formatting
  const formatBudget = useCallback(
    (amount: number) => formatCurrency(amount, currencyCode),
    [currencyCode],
  );

  // Timeline milestones
  const milestones = useMemo(() => {
    const hasBudget = totalBudget > 0;
    const hasGuests = guestCount > 0;

    return [
      {
        id: "budget",
        title: "Set budget and guest count",
        completed: hasBudget && hasGuests,
        timing: "NOW",
      },
      {
        id: "venue",
        title: "Select venue and book",
        completed: hasVenueSelected,
        timing: "NOW",
      },
      {
        id: "major",
        title: "Book major vendors",
        completed: coveredCount >= 3,
        timing: "NOW",
      },
      {
        id: "menu",
        title: "Finalize menu tasting",
        completed: false,
        timing: "6-8 months",
      },
      {
        id: "florist",
        title: "Book florist and decor",
        completed: false,
        timing: "6-8 months",
      },
      {
        id: "save",
        title: "Send save-the-dates",
        completed: false,
        timing: "6-8 months",
      },
      {
        id: "meetings",
        title: "Final vendor meetings",
        completed: false,
        timing: "3 months",
      },
      {
        id: "invites",
        title: "Send invitations",
        completed: false,
        timing: "3 months",
      },
    ];
  }, [totalBudget, guestCount, hasVenueSelected, coveredCount]);

  // Determine the primary "next step" action (must be before early return — Rules of Hooks)
  const nextStep = useMemo(() => {
    // Priority 1: Unsigned contracts / deposits due (venue selected but not booked)
    if (
      hasVenueSelected &&
      !primaryOption?.bookedVendorCategories?.includes("venue_location")
    ) {
      return {
        title: "Sign contract and pay deposit",
        description: `${selectedVenueName} is selected but not yet booked`,
        action: "View Details",
        actionTab: "compare",
        icon: "📝",
      };
    }

    // Priority 2: Unreviewed quotes
    const photoQuote = otherVendorQuotes.find((q) =>
      q.vendorType?.toLowerCase().includes("photo"),
    );
    if (
      photoQuote &&
      !primaryOption?.attachedVendorQuoteIds?.includes(photoQuote.id || "")
    ) {
      return {
        title: "Review photography quote",
        description: `${photoQuote.vendorName} sent you a quote for ${formatBudget(parseFloat(photoQuote.totalPrice || "0"))}`,
        action: "Review Quote",
        actionTab: "compare",
        icon: "📸",
      };
    }

    // Priority 3: No venue selected
    if (!hasVenueSelected) {
      if (venueQuotes.length === 0) {
        return {
          title: "Upload your first venue quote",
          description:
            "Get quotes from venues you like to start comparing your options",
          action: "Upload Quote",
          actionTab: "quotes",
          icon: "🏛️",
        };
      }
      return {
        title: "Compare your venue options and select one",
        description: `You have ${venueQuotes.length} venue quote${venueQuotes.length > 1 ? "s" : ""} ready to review`,
        action: "Compare Venues",
        actionTab: "compare",
        icon: "🏛️",
      };
    }

    // Priority 4: Missing high-priority vendors
    const missingEssential = vendorCoverage.find(
      (c) =>
        c.status === "needed" &&
        ["catering_food", "photography_video"].includes(c.categoryId),
    );
    if (missingEssential) {
      return {
        title: `Get quotes for ${missingEssential.categoryName}`,
        description: "Essential vendor for your wedding day",
        action: "Upload Quote",
        actionTab: "quotes",
        icon: "📋",
      };
    }

    // All caught up!
    return null;
  }, [
    hasVenueSelected,
    primaryOption,
    selectedVenueName,
    otherVendorQuotes,
    venueQuotes,
    vendorCoverage,
    formatBudget,
  ]);

  // Get "other tasks" (must be before early return — Rules of Hooks)
  const otherTasks = useMemo(() => {
    const tasks: {
      priority: "high" | "medium" | "low";
      title: string;
      vendor?: string;
      action: string;
      actionTab: string;
    }[] = [];

    if (!hasVenueSelected) {
      // Pre-selection: focus on gathering quotes
      if (venueQuotes.length < 2) {
        tasks.push({
          priority: "high",
          title: "Upload more venue quotes to compare",
          action: "Upload",
          actionTab: "quotes",
        });
      }
      // Categories with no uploaded quotes at all
      const essentialNoQuotes = [
        "catering_food",
        "photography_video",
        "bar_beverage",
      ].filter((catId) => !allQuoteCoveredCategories.has(catId));
      essentialNoQuotes.slice(0, 2).forEach((catId) => {
        const taxonomy = VENDOR_TAXONOMY[catId as VendorCategoryType];
        tasks.push({
          priority: "medium",
          title: `Get quotes for ${taxonomy?.name || catId}`,
          action: "Upload",
          actionTab: "quotes",
        });
      });
      return tasks.slice(0, 4);
    }

    // Post-selection: attach/book tasks
    if (
      !primaryOption?.bookedVendorCategories?.includes("venue_location") &&
      nextStep?.title !== "Sign contract and pay deposit"
    ) {
      tasks.push({
        priority: "high",
        title: "Sign contract and pay deposit",
        vendor: selectedVenueName || undefined,
        action: "View",
        actionTab: "compare",
      });
    }

    // Medium priority - missing essential vendors
    const essentialMissing = vendorCoverage
      .filter(
        (c) =>
          c.status === "needed" &&
          ["catering_food", "photography_video", "bar_beverage"].includes(
            c.categoryId,
          ),
      )
      .slice(0, 2);
    essentialMissing.forEach((cat) => {
      const hasUploadedQuote = allQuoteCoveredCategories.has(cat.categoryId);
      const title = hasUploadedQuote
        ? `Attach your ${cat.categoryName} vendor to an option`
        : `Get quotes for ${cat.categoryName}`;
      const actionTab = hasUploadedQuote ? "builder" : "quotes";
      if (nextStep?.title !== `Get quotes for ${cat.categoryName}`) {
        tasks.push({
          priority: "medium",
          title,
          action: hasUploadedQuote ? "Attach" : "Upload",
          actionTab,
        });
      }
    });

    // Low priority - nice-to-have vendors (only if no quote uploaded yet)
    const niceMissing = vendorCoverage
      .filter(
        (c) =>
          c.status === "needed" &&
          ["flowers_decor", "beauty_prep", "entertainment_music"].includes(
            c.categoryId,
          ) &&
          !allQuoteCoveredCategories.has(c.categoryId),
      )
      .map((c) => c.categoryName);
    if (niceMissing.length > 0) {
      tasks.push({
        priority: "low",
        title: niceMissing.join(", "),
        action: "",
        actionTab: "",
      });
    }

    return tasks.slice(0, 4);
  }, [
    hasVenueSelected,
    primaryOption,
    selectedVenueName,
    vendorCoverage,
    nextStep,
    allQuoteCoveredCategories,
    venueQuotes,
  ]);

  // Personalized next steps based on planning stage
  const getNextStepsContent = () => {
    if (planningStage === "exploring" || planningStage === "researching") {
      return {
        title: "Start Your Vendor Conversations",
        description:
          "Reach out to venues and vendors to gather quotes and information",
        primaryAction: "New Outreach",
        primaryTab: "comms",
        secondaryAction: "Already have a quote? Upload it",
        secondaryTab: "quotes",
        icon: <MessageSquare className="w-8 h-8 text-[#D4847A]" />,
        steps: [
          "Reach out to venues in your preferred locations",
          "Request quotes and availability",
          "Upload received quotes to compare options",
        ],
      };
    } else if (planningStage === "comparing") {
      return {
        title: "Compare Your Options",
        description:
          "Upload your quotes to compare them side-by-side and find the best fit",
        primaryAction: "Upload Quote",
        primaryTab: "quotes",
        secondaryAction: "Need more options? Reach out to vendors",
        secondaryTab: "comms",
        icon: <FileText className="w-8 h-8 text-[#D4847A]" />,
        steps: [
          "Upload quotes you've received",
          "Compare packages and pricing",
          "Make informed decisions",
        ],
      };
    } else {
      return {
        title: "Track Your Vendors",
        description:
          "Upload your confirmed quotes to keep everything organized in one place",
        primaryAction: "Upload Quote",
        primaryTab: "quotes",
        secondaryAction: "Set up your services and timeline",
        secondaryTab: "services",
        icon: <CheckSquare className="w-8 h-8 text-[#5D8A58]" />,
        steps: [
          "Upload confirmed vendor contracts",
          "Track payments and deadlines",
          "Manage your timeline",
        ],
      };
    }
  };

  // Empty state when no quotes uploaded
  if (quotes.length === 0) {
    const nextStepsContent = getNextStepsContent();

    return (
      <EmptyState
        icon={nextStepsContent.icon}
        title={nextStepsContent.title}
        subtitle={nextStepsContent.description}
        locationBadges={locations}
        steps={nextStepsContent.steps}
        primaryAction={{
          label: nextStepsContent.primaryAction,
          onClick: () => onTabChange(nextStepsContent.primaryTab),
          icon:
            nextStepsContent.primaryTab === "comms" ? (
              <MessageSquare className="w-4 h-4 mr-2" />
            ) : (
              <FileText className="w-4 h-4 mr-2" />
            ),
        }}
        secondaryAction={{
          label: nextStepsContent.secondaryAction,
          onClick: () => onTabChange(nextStepsContent.secondaryTab),
        }}
      />
    );
  }

  // Calculate coverage ring
  const coverageRingOffset = 176 - (eventAwareCoveragePercentage / 100) * 176;

  return (
    <div className="space-y-6">
      {/* 1. COMPACT WEDDING HERO */}
      <div className="bg-gradient-to-r from-[#FDF8F6] to-[#F8F5FB] rounded-2xl p-5 border border-[rgba(42,32,53,0.04)]">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <h1 className="font-display text-xl font-semibold text-[#2A2035]">
              {coupleName}
            </h1>
            <span className="text-[#9B8FA8]">·</span>
            {weddingDate && (
              <span className="text-[#6B617B]">
                {weddingDate.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            )}
            {hasVenueSelected && (
              <span className="flex items-center gap-1 px-3 py-1 bg-white rounded-full text-sm text-[#D4847A] border border-[rgba(212,132,122,0.2)]">
                <MapPin className="w-3.5 h-3.5" />
                {selectedVenueName}
              </span>
            )}
            <button
              onClick={() => onTabChange("settings")}
              className="p-1.5 rounded-full hover:bg-white/60 transition-colors"
              title="Edit wedding details"
              data-testid="button-edit-wedding-info"
            >
              <Pencil className="w-4 h-4 text-[#9B8FA8] hover:text-[#6B617B]" />
            </button>
          </div>
          {daysUntilWedding && daysUntilWedding > 0 && (
            <div className="text-right">
              <span className="text-2xl font-semibold text-[#D4847A]">
                {daysUntilWedding}
              </span>
              <span className="text-sm text-[#6B617B] ml-1">days to go</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. YOUR NEXT STEP - THE STAR */}
      {nextStep ? (
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-[rgba(42,32,53,0.06)]">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-[rgba(212,132,122,0.12)] flex items-center justify-center">
              <Target className="w-5 h-5 text-[#D4847A]" />
            </div>
            <h2 className="font-display text-lg font-semibold text-[#2A2035]">
              Your Next Step
            </h2>
          </div>

          <div className="bg-[#F8F5FB] rounded-xl p-6 mb-4">
            <h3 className="font-display text-2xl font-semibold text-[#2A2035] mb-2">
              {nextStep.title}
            </h3>
            <p className="text-[#6B617B] mb-4">{nextStep.description}</p>
            <Button
              className="px-6 py-3 rounded-xl text-white font-semibold text-base shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(135deg, #D4847A, #C4918A)",
              }}
              onClick={() => onTabChange(nextStep.actionTab)}
              data-testid="next-step-cta"
            >
              {nextStep.action} →
            </Button>
          </div>

          {otherTasks.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-[#6B617B]">
              <span>Up next:</span>
              <span className="text-[#3D3650]">{otherTasks[0]?.title}</span>
            </div>
          )}
        </div>
      ) : (
        // All caught up state
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-[rgba(42,32,53,0.06)] text-center">
          <div className="w-16 h-16 rounded-full bg-[rgba(139,168,136,0.15)] flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-[#5D8A58]" />
          </div>
          <h2 className="font-display text-2xl font-semibold text-[#2A2035] mb-2">
            You're all caught up!
          </h2>
          <p className="text-[#6B617B] mb-4">
            No urgent tasks right now. Here are some things you could work on:
          </p>
          <div className="flex justify-center gap-3">
            <Button
              variant="outline"
              className="px-4 py-2 rounded-lg border border-[rgba(42,32,53,0.12)] text-[#3D3650] font-medium hover:bg-[#F8F5FB]"
              onClick={() => onTabChange("compare")}
            >
              Compare venues
            </Button>
            <Button
              variant="outline"
              className="px-4 py-2 rounded-lg border border-[rgba(42,32,53,0.12)] text-[#3D3650] font-medium hover:bg-[#F8F5FB]"
              onClick={() => onTabChange("services")}
            >
              Review services
            </Button>
          </div>
        </div>
      )}

      {/* 3. QUICK STATS CARDS (Side by Side) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Coverage / Quote Progress Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[rgba(42,32,53,0.06)]">
          {!hasVenueSelected ? (
            <>
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-[#D4847A]" />
                <h3 className="font-semibold text-[#3D3650]">Quote Progress</h3>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#6B617B]">Venue quotes</span>
                  <span className="text-2xl font-semibold text-[#2A2035]">
                    {venueQuotes.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#6B617B]">Vendor quotes</span>
                  <span className="text-2xl font-semibold text-[#2A2035]">
                    {otherVendorQuotes.length}
                  </span>
                </div>
              </div>

              <p className="text-sm text-[#9B8FA8]">
                Keep collecting quotes to compare
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-[#D4847A]" />
                <h3 className="font-semibold text-[#3D3650]">
                  Vendor Coverage
                </h3>
              </div>

              <div className="flex items-center gap-4 mb-3">
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 transform -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="none"
                      stroke="rgba(42,32,53,0.08)"
                      strokeWidth="6"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="none"
                      stroke="#D4847A"
                      strokeWidth="6"
                      strokeDasharray="176"
                      strokeDashoffset={coverageRingOffset}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-[#2A2035]">
                    {eventAwareCoveragePercentage}%
                  </span>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-[#2A2035]">
                    {eventAwareCoveredCount} of {eventAwareTotalPairs}
                  </p>
                  <p className="text-sm text-[#6B617B]">services covered</p>
                </div>
              </div>

              <p className="text-sm text-[#D4847A] font-medium">
                {eventAwareGapsCount} still needed
              </p>

              <button
                onClick={() => onTabChange("compare")}
                className="text-sm text-[#D4847A] font-medium hover:underline mt-2 inline-block"
                data-testid="view-coverage-details"
              >
                View details →
              </button>
            </>
          )}
        </div>

        {/* Budget Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[rgba(42,32,53,0.06)]">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-[#D4847A]" />
            <h3 className="font-semibold text-[#3D3650]">Budget</h3>
          </div>

          {!hasVenueSelected ? (
            <>
              <p className="text-2xl font-semibold text-[#2A2035] mb-1">
                {formatBudget(totalBudget)}{" "}
                <span className="text-base font-normal text-[#6B617B]">
                  total budget
                </span>
              </p>
              <p className="text-sm text-[#9B8FA8] mt-2">
                Select a venue to track spending
              </p>
            </>
          ) : (
            <>
              <p className="text-2xl font-semibold text-[#2A2035] mb-1">
                {formatBudget(quotedTotal)}{" "}
                <span className="text-base font-normal text-[#6B617B]">
                  of {formatBudget(totalBudget)}
                </span>
              </p>

              <div className="h-2 bg-[rgba(42,32,53,0.08)] rounded-full overflow-hidden mb-3">
                <div
                  className="h-full rounded-full"
                  style={{
                    background:
                      budgetPercentage > 100
                        ? "#E07A5F"
                        : "linear-gradient(90deg, #D4847A, #C4918A)",
                    width: `${Math.min(budgetPercentage, 100)}%`,
                  }}
                />
              </div>

              {isOverBudget ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-[rgba(224,122,95,0.12)] rounded-lg w-fit">
                  <AlertTriangle className="w-4 h-4 text-[#E07A5F]" />
                  <span className="text-sm font-medium text-[#E07A5F]">
                    Over budget by {formatBudget(estimatedTotal - totalBudget)}
                  </span>
                </div>
              ) : (
                remainingBudget > 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-[rgba(139,168,136,0.12)] rounded-lg w-fit">
                    <CheckCircle2 className="w-4 h-4 text-[#5D8A58]" />
                    <span className="text-sm font-medium text-[#5D8A58]">
                      {formatBudget(remainingBudget)} under budget
                    </span>
                  </div>
                )
              )}
            </>
          )}
        </div>
      </div>

      {/* 4. OTHER TASKS (Compact List) */}
      {otherTasks.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[rgba(42,32,53,0.06)]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#D4847A]" />
              <h3 className="font-semibold text-[#3D3650]">Other Tasks</h3>
            </div>
            <span className="text-sm text-[#6B617B]">
              {otherTasks.length} remaining
            </span>
          </div>

          <div className="space-y-2">
            {otherTasks.map((task, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex items-center justify-between py-2",
                  idx < otherTasks.length - 1 &&
                    "border-b border-[rgba(42,32,53,0.06)]",
                  task.priority === "low" && "opacity-60",
                )}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full",
                      task.priority === "high"
                        ? "bg-[#D4847A]"
                        : task.priority === "medium"
                          ? "bg-[#6B617B]"
                          : "bg-[#9B8FA8]",
                    )}
                  />
                  <span
                    className={
                      task.priority === "low"
                        ? "text-[#6B617B]"
                        : "text-[#3D3650]"
                    }
                  >
                    {task.title}
                  </span>
                  {task.vendor && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(212,132,122,0.1)] text-[#D4847A]">
                      {task.vendor}
                    </span>
                  )}
                  {task.priority === "low" && (
                    <span className="text-xs text-[#9B8FA8]">
                      can wait 2+ months
                    </span>
                  )}
                </div>
                {task.action && task.actionTab && (
                  <button
                    onClick={() => onTabChange(task.actionTab)}
                    className="text-sm text-[#D4847A] font-medium hover:underline"
                  >
                    {task.action} →
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. TIMELINE & ACTIVITY (Collapsed by Default) */}
      <div className="space-y-3">
        {/* Planning Timeline - collapsed */}
        <details className="bg-white rounded-2xl shadow-sm border border-[rgba(42,32,53,0.06)] group">
          <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#D4847A]" />
              <h3 className="font-semibold text-[#3D3650]">
                Planning Timeline
              </h3>
            </div>
            <ChevronDown className="w-5 h-5 text-[#9B8FA8] group-open:rotate-180 transition-transform" />
          </summary>

          <div className="px-5 pb-5 pt-2 border-t border-[rgba(42,32,53,0.06)]">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#6B617B] mb-2">
                  NOW {daysUntilWedding && `(${daysUntilWedding} days out)`}
                </p>
                <div className="space-y-2">
                  {milestones.slice(0, 3).map((m) => (
                    <div key={m.id} className="flex items-center gap-2">
                      {m.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-[#5D8A58]" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-[#D4847A]" />
                      )}
                      <span
                        className={
                          m.completed ? "text-[#3D3650]" : "text-[#D4847A]"
                        }
                      >
                        {m.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#9B8FA8] mb-2">
                  6-8 MONTHS OUT
                </p>
                <div className="space-y-2 opacity-60">
                  {milestones.slice(3, 6).map((m) => (
                    <div key={m.id} className="flex items-center gap-2">
                      <div className="w-4 h-4 border border-[#9B8FA8] rounded" />
                      <span className="text-[#6B617B]">{m.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </details>

        {/* Recent Activity - collapsed */}
        <details className="bg-white rounded-2xl shadow-sm border border-[rgba(42,32,53,0.06)] group">
          <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#D4847A]" />
              <h3 className="font-semibold text-[#3D3650]">Recent Activity</h3>
            </div>
            <ChevronDown className="w-5 h-5 text-[#9B8FA8] group-open:rotate-180 transition-transform" />
          </summary>

          <div className="px-5 pb-5 pt-2 border-t border-[rgba(42,32,53,0.06)]">
            <ul className="space-y-2 text-sm text-[#6B617B]">
              {hasVenueSelected && selectedVenueQuote && (
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9B8FA8]" />
                  Selected {selectedVenueQuote.vendorName} as venue
                </li>
              )}
              {quotes.slice(0, 4).map((quote) => (
                <li key={quote.id} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9B8FA8]" />
                  Uploaded {quote.vendorName} quote
                </li>
              ))}
            </ul>
          </div>
        </details>
      </div>
    </div>
  );
}
