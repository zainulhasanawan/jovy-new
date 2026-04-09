import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  DollarSign,
  MapPin,
  PartyPopper,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { SettingsEditModal } from "./SettingsEditModal";
import { DateChangeConfirmModal } from "./DateChangeConfirmModal";
import { PaymentSubscriptionSection } from "./PaymentSubscriptionSection";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";
import { COMMON_COUNTRIES } from "@/data/checklist-defaults";
import type { DateInfo, User } from "@/types/dashboard/schema";

interface WeddingEvent {
  id?: string;
  key?: string;
  name?: string;
  emoji?: string;
  enabled?: boolean;
}

type WeddingProfile = NonNullable<User["weddingProfile"]> & {
  homeCountry?: string;
  openToSuggestions?: boolean;
  locationDecided?: boolean;
  events?: WeddingEvent[];
};

type SaveData = {
  dateInfo?: DateInfo | null;
  budget?: {
    totalBudget?: number;
    currency?: string;
  };
  guestInfo?: {
    estimatedCount?: number;
  };
  locationDecided?: boolean;
} & Record<string, unknown>;

interface SettingsCardProps {
  icon: ReactNode;
  title: string;
  description?: string;
  isEditing?: boolean;
  onEdit?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  children: ReactNode;
  editContent?: ReactNode;
  isSaving?: boolean;
  linkTo?: string;
  linkText?: string;
}

function SettingsCard({
  icon,
  title,
  description,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  children,
  editContent,
  isSaving,
  linkTo,
  linkText,
}: SettingsCardProps) {
  const navigate = useNavigate();
  const setLocation = (path: string) => navigate(path);

  return (
    <div className="bg-white rounded-2xl border border-[rgba(42,32,53,0.06)] shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b border-[rgba(42,32,53,0.06)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F8F5FB] flex items-center justify-center">
            {icon}
          </div>
          <div>
            <h2 className="font-semibold text-[#2A2035]">{title}</h2>
            {description && (
              <p className="text-sm text-[#6B617B]">{description}</p>
            )}
          </div>
        </div>

        {linkTo ? (
          <button
            onClick={() => setLocation(linkTo)}
            className="px-4 py-2 rounded-lg border border-[rgba(42,32,53,0.12)] text-[#3D3650] text-sm font-medium hover:bg-[#F8F5FB] transition-colors"
            data-testid={`link-${title.toLowerCase().replace(/\s+/g, "-")}`}
          >
            {linkText || "Edit"}
          </button>
        ) : !isEditing ? (
          <button
            onClick={onEdit}
            className="px-4 py-2 rounded-lg border border-[rgba(42,32,53,0.12)] text-[#3D3650] text-sm font-medium hover:bg-[#F8F5FB] transition-colors"
            data-testid={`button-edit-${title.toLowerCase().replace(/\s+/g, "-")}`}
          >
            Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-lg text-[#6B617B] text-sm font-medium hover:bg-[#F8F5FB] transition-colors"
              data-testid={`button-cancel-${title.toLowerCase().replace(/\s+/g, "-")}`}
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={isSaving}
              className="px-4 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50 transition-colors"
              style={{
                background: "linear-gradient(135deg, #D4847A, #C4918A)",
              }}
              data-testid={`button-save-${title.toLowerCase().replace(/\s+/g, "-")}`}
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        )}
      </div>
      <div className="p-5">{isEditing ? editContent : children}</div>
    </div>
  );
}

// Wedding Settings Component - Modal-based editing
export function WeddingSettings({
  user,
  onUpdate,
  userId,
  onTestOnboarding,
}: {
  user: User | null;
  onUpdate: () => void;
  userId: string;
  onTestOnboarding?: () => void;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const weddingProfile = user?.weddingProfile as WeddingProfile | undefined;

  // Single state to track which modal is open
  const [editSection, setEditSection] = useState<
    "names" | "date" | "location" | "budget" | "planning-stage" | null
  >(null);

  // Date change confirmation modal state
  const [showDateChangeModal, setShowDateChangeModal] = useState(false);
  const [dateChangeInfo, setDateChangeInfo] = useState<{
    oldDate: Date | null;
    newDate: Date;
  } | null>(null);
  const [isUpdatingTimeline, setIsUpdatingTimeline] = useState(false);

  // Fetch checklist items to check if any exist
  const { data: checklistItems = [] } = useQuery<unknown[]>({
    queryKey: ["/api/checklist", userId],
    enabled: !!userId,
  });

  const currencySymbols: Record<string, string> = {
    EUR: "€",
    USD: "$",
    GBP: "£",
  };
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const planningStageOptions = [
    {
      value: "exploring",
      label: "Exploring",
      description: "Just started looking around",
    },
    {
      value: "researching",
      label: "Researching",
      description: "Gathering options and information",
    },
    {
      value: "comparing",
      label: "Comparing",
      description: "Evaluating quotes and vendors",
    },
    {
      value: "booked",
      label: "Booked",
      description: "Major vendors are confirmed",
    },
  ];

  // Calculate days until wedding
  const weddingDateStr =
    weddingProfile?.timeline?.weddingDate ||
    weddingProfile?.dateInfo?.specificDate;
  const daysUntil = weddingDateStr
    ? Math.ceil(
        (new Date(weddingDateStr).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24),
      )
    : null;

  // Get couple names from profile
  const coupleNames = weddingProfile?.coupleNames || "";
  const [name1, name2] = coupleNames
    .split(" & ")
    .map((n: string) => n?.trim() || "");

  // Get home country name from code
  const getHomeCountryName = () => {
    const code = weddingProfile?.homeCountry;
    if (!code) return null;
    const country = COMMON_COUNTRIES.find((c) => c.code === code);
    return country?.name || code;
  };

  // Format date display based on dateType - check both dateInfo (new format) and timeline (legacy)
  const getDateDisplay = () => {
    const dateInfo = weddingProfile?.dateInfo;
    const timeline = weddingProfile?.timeline as
      | (Partial<DateInfo> & { weddingDate?: string })
      | undefined;
    const dateSource = (dateInfo || timeline) as Partial<DateInfo> | undefined;

    if (!dateSource?.dateType) {
      // Legacy format - specific date only
      return weddingDateStr
        ? new Date(weddingDateStr).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })
        : "Not set";
    }

    switch (dateSource.dateType) {
      case "specific":
        return dateSource.specificDate
          ? new Date(dateSource.specificDate).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })
          : "Not set";
      case "month":
        return dateSource.month && dateSource.year
          ? `${months[dateSource.month - 1]} ${dateSource.year}`
          : "Not set";
      case "season": {
        const capitalizedSeason = dateSource.season
          ? dateSource.season.charAt(0).toUpperCase() +
            dateSource.season.slice(1)
          : "";
        return dateSource.season && dateSource.year
          ? `${capitalizedSeason} ${dateSource.year}`
          : "Not set";
      }
      case "year":
        return dateSource.year ? `${dateSource.year}` : "Not set";
      case "undecided":
        return "Not yet decided";
      default:
        return "Not set";
    }
  };

  // Helper to calculate Date from dateInfo
  const getDateFromDateInfo = (
    dateInfo: DateInfo | null | undefined,
  ): Date | null => {
    if (!dateInfo) return null;

    const getSeasonMonth = (season: string): number => {
      switch (season) {
        case "spring":
          return 4;
        case "summer":
          return 7;
        case "fall":
          return 10;
        case "winter":
          return 1;
        default:
          return 1;
      }
    };

    if (dateInfo.dateType === "specific" && dateInfo.specificDate) {
      return new Date(dateInfo.specificDate);
    }
    if (dateInfo.dateType === "month" && dateInfo.year && dateInfo.month) {
      return new Date(dateInfo.year, dateInfo.month - 1, 15);
    }
    if (dateInfo.dateType === "season" && dateInfo.year && dateInfo.season) {
      return new Date(dateInfo.year, getSeasonMonth(dateInfo.season) - 1, 15);
    }
    return null;
  };

  // Get current wedding date for comparison
  const getCurrentWeddingDate = (): Date | null => {
    const dateInfo = weddingProfile?.dateInfo;
    if (dateInfo) return getDateFromDateInfo(dateInfo);
    if (weddingDateStr) return new Date(weddingDateStr);
    return null;
  };

  // Handle save from modal - merge data and PATCH to API
  const handleModalSave = async (data: SaveData) => {
    try {
      // Check if this is a date change
      const isDateChange = editSection === "date" && data.dateInfo;
      const oldDate = getCurrentWeddingDate();
      const newDate = isDateChange ? getDateFromDateInfo(data.dateInfo) : null;

      const updatedProfile = {
        ...weddingProfile,
        ...data,
      };
      await apiRequest(
        "PATCH",
        `/api/users/${userId}/wedding-profile`,
        updatedProfile,
      );
      onUpdate();

      // Auto-complete checklist tasks based on what was saved
      const autoCompleteSettings = async () => {
        try {
          // Budget set/changed
          if (editSection === "budget" && data.budget?.totalBudget) {
            await apiRequest("POST", "/api/checklist/auto-complete", {
              userId,
              trigger: "settings_updated",
              settingsField: "budget",
            });
          }
          // Guest count set
          if (editSection === "budget" && data.guestInfo?.estimatedCount) {
            await apiRequest("POST", "/api/checklist/auto-complete", {
              userId,
              trigger: "settings_updated",
              settingsField: "guest_count",
            });
          }
          // Wedding date set
          if (isDateChange && newDate) {
            await apiRequest("POST", "/api/checklist/auto-complete", {
              userId,
              trigger: "settings_updated",
              settingsField: "wedding_date",
            });
          }
          // Location decided - also triggers wedding_date check
          if (editSection === "location" && data.locationDecided) {
            await apiRequest("POST", "/api/checklist/auto-complete", {
              userId,
              trigger: "settings_updated",
              settingsField: "wedding_date",
            });
          }
          queryClient.invalidateQueries({
            queryKey: ["/api/checklist", userId],
          });
        } catch (error) {
          console.error("Failed to auto-complete checklist tasks:", error);
        }
      };

      // Check if date actually changed and checklist exists
      // Consider it a change if: old is null and new is set, OR both exist but are different
      const datesAreDifferent =
        newDate && (!oldDate || oldDate.getTime() !== newDate.getTime());
      const hasChecklist = checklistItems.length > 0;

      // Run auto-complete in the background
      autoCompleteSettings();

      if (isDateChange && datesAreDifferent && hasChecklist) {
        // Show date change confirmation modal
        setDateChangeInfo({ oldDate, newDate });
        setShowDateChangeModal(true);
      } else {
        toast({
          title: "Settings saved",
          description: "Your wedding details have been updated.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Handle keeping current checklist dates
  const handleKeepCurrentDates = () => {
    setShowDateChangeModal(false);
    setDateChangeInfo(null);
    toast({
      title: "Settings saved",
      description:
        "Your wedding date was updated. Checklist dates remain unchanged.",
    });
  };

  // Handle updating checklist timeline
  const handleUpdateTimeline = async () => {
    if (!dateChangeInfo?.newDate) return;

    setIsUpdatingTimeline(true);
    try {
      await apiRequest("POST", "/api/checklist/recalculate-dates", {
        userId,
        newWeddingDate: dateChangeInfo.newDate.toISOString(),
      });

      // Invalidate checklist query to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/checklist", userId] });

      setShowDateChangeModal(false);
      setDateChangeInfo(null);
      toast({
        title: "Timeline updated",
        description:
          "Your checklist dates have been recalculated based on your new wedding date.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to update checklist timeline.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingTimeline(false);
    }
  };

  // Build currentData for modal based on section
  const getModalCurrentData = () => {
    const profileCurrency = weddingProfile?.budget?.currency;
    const currency: "EUR" | "USD" | "GBP" =
      profileCurrency === "USD" ||
      profileCurrency === "GBP" ||
      profileCurrency === "EUR"
        ? profileCurrency
        : "EUR";

    return {
      partner1Name: name1 || "",
      partner2Name: name2 || "",
      homeCountry: weddingProfile?.homeCountry || "",
      dateInfo: weddingProfile?.dateInfo || null,
      weddingDate: weddingDateStr || null,
      locations: weddingProfile?.locations || [],
      openToSuggestions: weddingProfile?.openToSuggestions || false,
      locationDecided: weddingProfile?.locationDecided || false,
      guestCount: weddingProfile?.guestInfo?.estimatedCount || undefined,
      budget: weddingProfile?.budget?.totalBudget || undefined,
      currency,
      planningStage: weddingProfile?.planningStage || undefined,
    };
  };

  // Get enabled events
  const enabledEvents =
    weddingProfile?.events?.filter((event): event is WeddingEvent =>
      Boolean(event?.enabled),
    ) || [];

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-[#2A2035] mb-2">
          Settings
        </h1>
        <p className="text-[#6B617B]">Manage your wedding details</p>
      </div>

      <div className="space-y-4">
        {/* Wedding Details Section */}
        <SettingsCard
          icon={<Users className="w-5 h-5 text-[#D4847A]" />}
          title="Wedding Details"
          onEdit={() => setEditSection("names")}
          children={
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[#6B617B]">Couple</span>
                <span
                  className="font-semibold text-[#2A2035]"
                  data-testid="text-couple-names"
                >
                  {name1 && name2 ? `${name1} & ${name2}` : "Not set"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B617B]">Home Country</span>
                <span
                  className="font-semibold text-[#2A2035]"
                  data-testid="text-home-country"
                >
                  {getHomeCountryName() || "Not set"}
                </span>
              </div>
            </div>
          }
        />

        {/* Wedding Date Section */}
        <SettingsCard
          icon={<Calendar className="w-5 h-5 text-[#D4847A]" />}
          title="Wedding Date"
          onEdit={() => setEditSection("date")}
          children={
            <div className="flex justify-between items-center">
              <span className="text-[#6B617B]">Date</span>
              <div className="text-right">
                <span
                  className="font-semibold text-[#2A2035]"
                  data-testid="text-wedding-date"
                >
                  {getDateDisplay()}
                </span>
                {daysUntil && daysUntil > 0 && (
                  <p className="text-sm text-[#D4847A]">
                    {daysUntil} days to go
                  </p>
                )}
              </div>
            </div>
          }
        />

        {/* Budget & Guests Section */}
        <SettingsCard
          icon={<DollarSign className="w-5 h-5 text-[#D4847A]" />}
          title="Budget & Guests"
          onEdit={() => setEditSection("budget")}
          children={
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[#6B617B]">Guests</span>
                <span
                  className="font-semibold text-[#2A2035]"
                  data-testid="text-guest-count"
                >
                  {weddingProfile?.guestInfo?.estimatedCount
                    ? `${weddingProfile.guestInfo.estimatedCount} guests`
                    : "Not set"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B617B]">Budget</span>
                <span
                  className="font-semibold text-[#2A2035]"
                  data-testid="text-budget"
                >
                  {weddingProfile?.budget?.totalBudget
                    ? `${currencySymbols[weddingProfile.budget?.currency || "EUR"]}${weddingProfile.budget.totalBudget.toLocaleString()} ${weddingProfile.budget?.currency || "EUR"}`
                    : "Not set"}
                </span>
              </div>
            </div>
          }
        />

        {/* Locations Section */}
        <SettingsCard
          icon={<MapPin className="w-5 h-5 text-[#D4847A]" />}
          title="Locations"
          onEdit={() => setEditSection("location")}
          children={
            <div className="flex flex-wrap gap-2">
              {(weddingProfile?.locations || []).length > 0 ? (
                (
                  (weddingProfile?.locations || []) as Array<{
                    name: string;
                    placeId?: string;
                  }>
                ).map((loc, idx) => (
                  <span
                    key={loc.placeId || idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F8F5FB] rounded-full text-sm"
                    data-testid={`location-chip-${idx}`}
                  >
                    <MapPin className="w-3 h-3 text-[#D4847A]" />
                    <span className="text-[#3D3650]">
                      {loc.name.split(",")[0]}
                    </span>
                  </span>
                ))
              ) : (
                <span className="text-[#9B8FA8]">No locations set</span>
              )}
            </div>
          }
        />

        {/* Planning Stage Section */}
        <SettingsCard
          icon={<Target className="w-5 h-5 text-[#D4847A]" />}
          title="Planning Stage"
          onEdit={() => setEditSection("planning-stage")}
          children={
            <div className="flex justify-between items-center">
              <span className="text-[#6B617B]">Current stage</span>
              <span
                className="font-semibold text-[#2A2035]"
                data-testid="text-planning-stage"
              >
                {planningStageOptions.find(
                  (s) =>
                    s.value === (weddingProfile?.planningStage || "exploring"),
                )?.label || "Exploring"}
              </span>
            </div>
          }
        />

        {/* Events Section - Read Only, links to Services */}
        <SettingsCard
          icon={<PartyPopper className="w-5 h-5 text-[#D4847A]" />}
          title="Events"
          description={`${enabledEvents.length} events planned`}
          linkTo="/dashboard/services"
          linkText="Manage"
          children={
            <div className="flex flex-wrap gap-2">
              {enabledEvents.length > 0 ? (
                enabledEvents.map((event) => (
                  <span
                    key={event.id || event.key}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F8F5FB] rounded-full text-sm"
                    data-testid={`event-chip-${event.name?.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <span>{event.emoji}</span>
                    <span className="text-[#3D3650]">{event.name}</span>
                  </span>
                ))
              ) : (
                <span className="text-[#9B8FA8]">No events configured</span>
              )}
            </div>
          }
        />

        {/* Payment & Subscription Section */}
        <PaymentSubscriptionSection userId={userId} />

        {/* Developer Tools Section */}
        {onTestOnboarding && (
          <div className="mt-6 pt-6 border-t border-dashed border-[rgba(42,32,53,0.15)]">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-[#9B8FA8]" />
              <span className="text-sm font-medium text-[#9B8FA8]">
                Developer Tools
              </span>
            </div>
            <Button
              variant="outline"
              onClick={onTestOnboarding}
              className="w-full text-[#6B617B] border-dashed hover:border-[#D4847A] hover:text-[#D4847A]"
              data-testid="btn-test-onboarding"
            >
              Test Onboarding Flow
            </Button>
          </div>
        )}

        {/* Sign Out Section */}
        <SignOutSection />
      </div>

      {/* Settings Edit Modal */}
      {editSection && (
        <SettingsEditModal
          open={!!editSection}
          onOpenChange={(open: boolean) => !open && setEditSection(null)}
          section={editSection}
          currentData={getModalCurrentData()}
          onSave={handleModalSave}
        />
      )}

      {/* Date Change Confirmation Modal */}
      {dateChangeInfo && (
        <DateChangeConfirmModal
          open={showDateChangeModal}
          onOpenChange={setShowDateChangeModal}
          oldDate={dateChangeInfo.oldDate}
          newDate={dateChangeInfo.newDate}
          checklistItems={checklistItems}
          onKeepCurrentDates={handleKeepCurrentDates}
          onUpdateTimeline={handleUpdateTimeline}
          isUpdating={isUpdatingTimeline}
        />
      )}
    </div>
  );
}

// Sign Out Section Component
function SignOutSection() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const setLocation = (path: string) => navigate(path);
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      setLocation("/");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <div className="mt-8 pt-6 border-t border-[rgba(42,32,53,0.08)]">
      <Button
        variant="outline"
        onClick={handleSignOut}
        disabled={signingOut}
        className="w-full text-muted-foreground hover:text-primary hover:border-primary"
        data-testid="btn-sign-out"
      >
        {signingOut ? "Signing out..." : "Sign Out"}
      </Button>
    </div>
  );
}
