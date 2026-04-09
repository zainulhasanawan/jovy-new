import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, MessageSquare } from "lucide-react";
import { CommsCenter } from "@/components/dashboard/comms/CommsCenter";
import { QuoteComparison } from "@/components/dashboard/quotes/QuoteComparison";
import { PlanningOverview } from "@/components/dashboard/overview/PlanningOverview";
import { WeddingSettings } from "@/components/dashboard/settings/WeddingSettings";
import { CompareSection } from "@/components/dashboard/compare/CompareSection";
import { ServicesSection } from "@/components/dashboard/services/ServicesSection";
import { PlanningSection } from "@/components/dashboard/planning/PlanningSection";
// Unavailable in current workspace:
// import { FeatureLockedModal } from "@/components/feature-locked-modal";
import type {
  DashboardSection,
  LockedFeature,
} from "@/types/dashboard/dashboard-types";
// Unavailable in current workspace:
// import type { Quote, User, WeddingOption } from "@shared/schema";

type Quote = Record<string, unknown>;
type WeddingOption = Record<string, unknown>;
type User = Record<string, unknown>;

const ErrorBoundary = ({
  children,
}: {
  section: string;
  children: ReactNode;
}) => <>{children}</>;

const FeatureLockedModal: (props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: string;
}) => null = () => null;

type DashboardSectionContentProps = {
  activeSection: DashboardSection;
  canAccessCompare: boolean;
  canAccessComms: boolean;
  showFeatureLocked: boolean;
  lockedFeature: LockedFeature;
  onFeatureLockedChange: (open: boolean) => void;
  onLockedFeatureChange: (feature: LockedFeature) => void;
  onNavigate: (path: string) => void;
  userId: string;
  quotes: Quote[];
  guestCount: number;
  openUpload: () => void;
  user: User | null;
  savedPackages: unknown[];
  weddingOptions: WeddingOption[];
  onUserRefresh: () => void;
  onTestOnboarding: () => void;
};

export function DashboardSectionContent({
  activeSection,
  canAccessCompare,
  canAccessComms,
  showFeatureLocked,
  lockedFeature,
  onFeatureLockedChange,
  onLockedFeatureChange,
  onNavigate,
  userId,
  quotes,
  guestCount,
  openUpload,
  user,
  savedPackages,
  weddingOptions,
  onUserRefresh,
  onTestOnboarding,
}: DashboardSectionContentProps) {
  switch (activeSection) {
    case "comms":
      if (!canAccessComms) {
        return (
          <ErrorBoundary section="Comms">
            <FeatureLockedModal
              open={showFeatureLocked && lockedFeature === "comms"}
              onOpenChange={(open: boolean) => {
                onFeatureLockedChange(open);
                if (!open) onNavigate("/dashboard");
              }}
              feature="comms"
            />
            <div className="min-h-[400px] flex items-center justify-center p-8">
              <div className="max-w-md w-full text-center space-y-6">
                <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-[#F2E4E6] to-[#E4D9EE] flex items-center justify-center">
                  <MessageSquare className="w-10 h-10 text-[#D4847A]" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-display font-bold text-[#2A2035]">
                    Vendor Outreach is Locked
                  </h2>
                  <p className="text-[#6B617B] font-body">
                    Your free trial has ended. Upgrade to Jovy Pro to unlock
                    AI-powered vendor outreach and communication tracking.
                  </p>
                </div>
                <Button
                  onClick={() => {
                    onLockedFeatureChange("comms");
                    onFeatureLockedChange(true);
                  }}
                  className="bg-gradient-to-r from-[#D4847A] to-[#C4918A] hover:from-[#C4918A] hover:to-[#B89E8A] text-white font-body shadow-md"
                  size="lg"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Upgrade to Jovy Pro
                </Button>
              </div>
            </div>
          </ErrorBoundary>
        );
      }

      return (
        <ErrorBoundary section="Comms">
          <CommsCenter userId={userId} />
        </ErrorBoundary>
      );

    case "quotes":
      return (
        <ErrorBoundary section="Quotes">
          <QuoteComparison
            quotes={quotes}
            userId={userId}
            guestCount={guestCount}
            onAddQuote={openUpload}
            onTabChange={(tab: string) => onNavigate(`/dashboard/${tab}`)}
          />
        </ErrorBoundary>
      );

    case "compare":
      if (!canAccessCompare) {
        return (
          <ErrorBoundary section="Options Builder">
            <FeatureLockedModal
              open={showFeatureLocked && lockedFeature === "compare"}
              onOpenChange={(open: boolean) => {
                onFeatureLockedChange(open);
                if (!open) onNavigate("/dashboard");
              }}
              feature="compare"
            />
            <div className="p-8 text-center">
              <p className="text-muted-foreground mb-4">
                This feature requires Jovy Pro
              </p>
              <Button
                onClick={() => {
                  onLockedFeatureChange("compare");
                  onFeatureLockedChange(true);
                }}
              >
                Upgrade Now
              </Button>
            </div>
          </ErrorBoundary>
        );
      }

      return (
        <ErrorBoundary section="Options Builder">
          <CompareSection
            userId={userId}
            quotes={quotes}
            guestCount={guestCount}
            onUploadClick={openUpload}
          />
        </ErrorBoundary>
      );

    case "services":
      return (
        <ErrorBoundary section="Services">
          <ServicesSection userId={userId} />
        </ErrorBoundary>
      );

    case "settings":
      return (
        <ErrorBoundary section="Settings">
          <WeddingSettings
            user={user}
            userId={userId}
            onUpdate={onUserRefresh}
            onTestOnboarding={onTestOnboarding}
          />
        </ErrorBoundary>
      );

    case "planning":
      return (
        <ErrorBoundary section="Planning">
          <PlanningSection userId={userId} user={user} quotes={quotes} />
        </ErrorBoundary>
      );

    case "overview":
    default:
      return (
        <ErrorBoundary section="Overview">
          <PlanningOverview
            user={user}
            quotes={quotes}
            savedPackages={savedPackages}
            weddingOptions={weddingOptions}
            onTabChange={(tab: string) =>
              onNavigate(`/dashboard/${tab === "overview" ? "" : tab}`)
            }
          />
        </ErrorBoundary>
      );
  }
}
