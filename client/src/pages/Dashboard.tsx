import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/services/supabase";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardSectionContent } from "@/components/dashboard/DashboardSectionContent";
import { DashboardLoadingState } from "@/components/dashboard/DashboardLoadingState";
import { getActiveDashboardSection } from "@/utils/dashboard/routing";
import { buildOnboardingUpdatePayload } from "@/utils/dashboard/onboarding";
import type { OnboardingUser } from "@/types/dashboard/onboarding";
import type { LockedFeature } from "@/types/dashboard/dashboard-types";
import { useUser } from "@/hooks/useUser";
import { apiRequest as queryApiRequest } from "@/lib/queryClient";

type WeddingDetails = {
  partner1Name?: string;
  partner2Name?: string;
  homeCountry?: string;
  weddingDate?: string;
  guestCount?: number;
  budget?: number;
  currency?: string;
  events?: Array<{ id?: string; name?: string; key?: string; type?: string }>;
  dateInfo?: unknown;
  locations?: unknown[];
  openToSuggestions?: boolean;
  locationDecided?: boolean;
  planningStage?: string;
};

type Quote = Record<string, unknown>;
type WeddingOption = Record<string, unknown>;
type User = {
  id?: string;
  email?: string;
  onboardingComplete?: boolean;
  weddingProfile?: {
    tourCompleted?: boolean;
    guestInfo?: { estimatedCount?: number };
  } & Record<string, unknown>;
} & Record<string, unknown>;

const OnboardingTour: (props: {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => Promise<void>;
  onNavigate: (section: string) => void;
}) => null = () => null;

const TrialBanner = () => null;
const WelcomeBanner = () => null;

function useToast() {
  return {
    toast: (params?: { title?: string; description?: string }) => {
      void params;
    },
  };
}

function useQuoteUpload() {
  return {
    openUpload: () => {},
  };
}

function useFeatureAccess() {
  return {
    canAccessCompare: true,
    canAccessComms: true,
  };
}

async function apiRequest(method: string, url: string, body?: unknown) {
  const request: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (body !== undefined) {
    request.body = JSON.stringify(body);
  }

  return fetch(url, request);
}

async function fetchJson<T>(url: string, fallback: T): Promise<T> {
  try {
    const response = await queryApiRequest("GET", url);
    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}

export default function Dashboard() {
  const [forceShowOnboarding, setForceShowOnboarding] = useState(false);
  const [tourDismissed, setTourDismissed] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  // Global quote upload modal
  const { openUpload } = useQuoteUpload();

  // Temporary fallback to existing auth hook in this workspace
  const { user: authUser } = useUser();
  const userId = authUser?.id || "";

  // Feature access control
  const { canAccessCompare, canAccessComms } = useFeatureAccess();
  const [showFeatureLocked, setShowFeatureLocked] = useState(false);
  const [lockedFeature, setLockedFeature] = useState<LockedFeature>("compare");

  // Path-based navigation using React Router
  const location = useLocation();
  const navigate = useNavigate();
  const setLocation = (path: string) => navigate(path);
  const locationPath = location.pathname;
  const activeSection = getActiveDashboardSection(locationPath);

  // Fetch user data
  const {
    data: userData,
    isLoading: userLoading,
    isError: userError,
    error: userQueryError,
  } = useQuery<User | null>({
    queryKey: ["/api/users", userId],
    enabled: !!userId,
    queryFn: () => fetchJson<User | null>(`/api/users/${userId}`, null),
    retry: (failureCount, error) => {
      // Don't retry on 404 - user doesn't exist yet, will be handled by init
      const status = (error as { status?: number }).status;
      if (error instanceof Error && status === 404) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // Fetch user quotes
  const { data: quotes = [] } = useQuery<Quote[]>({
    queryKey: ["/api/quotes/user", userId],
    enabled: !!userId,
    queryFn: () => fetchJson<Quote[]>(`/api/quotes/user/${userId}`, []),
  });

  // Fetch saved packages to get actual selected services cost
  const { data: savedPackages = [] } = useQuery<unknown[]>({
    queryKey: ["/api/packages/user", userId],
    enabled: !!userId,
    queryFn: () => fetchJson<unknown[]>(`/api/packages/user/${userId}`, []),
  });

  // Fetch wedding options for budget calculation
  const { data: weddingOptions = [] } = useQuery<WeddingOption[]>({
    queryKey: ["/api/wedding-options/user", userId],
    enabled: !!userId,
    queryFn: () =>
      fetchJson<WeddingOption[]>(`/api/wedding-options/user/${userId}`, []),
  });

  const user = userData ?? null;
  const showQuestionnaire = userData?.onboardingComplete === false;
  const profile = userData?.weddingProfile as
    | { tourCompleted?: boolean }
    | null
    | undefined;
  const showTour = Boolean(
    userData?.onboardingComplete && !profile?.tourCompleted && !tourDismissed,
  );

  // Background PDF processing completions handled by GlobalQuoteUpload

  const updateUserMutation = useMutation({
    mutationFn: async (userData: Record<string, unknown>) => {
      const response = await apiRequest(
        "PUT",
        `/api/users/${userId}`,
        userData,
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId] });
      queryClient.invalidateQueries({
        queryKey: ["/api/event-requirements", userId],
      });
      toast({
        title: "Profile updated",
        description: "Your wedding preferences have been saved.",
      });
    },
  });

  // Ensure user is initialized if they don't exist yet
  // This handles cases where the user was created in Supabase but not yet in our app database
  useEffect(() => {
    if (!userId || userData || userLoading) return; // Skip if no userId, user already loaded, or still loading

    // If user query fails with 404, try to initialize the user
    if (userError && authUser) {
      // Check if error is a 404 (user not found)
      const is404 =
        (userQueryError as { status?: number } | null)?.status === 404;

      if (is404) {
        const initUser = async () => {
          try {
            const {
              data: { session },
            } = await supabase.auth.getSession();
            const token = session?.access_token;

            const headers: Record<string, string> = {
              "Content-Type": "application/json",
            };
            if (token) {
              headers["Authorization"] = `Bearer ${token}`;
            }

            const response = await fetch("/api/users/init", {
              method: "POST",
              headers,
              body: JSON.stringify({
                id: authUser.id,
                email: authUser.email || "",
                name:
                  authUser.user_metadata?.name ||
                  authUser.email?.split("@")[0] ||
                  "User",
                seedDemo: false,
              }),
            });

            if (response.ok) {
              // User initialized, refetch user data
              queryClient.invalidateQueries({
                queryKey: ["/api/users", userId],
              });
            }
          } catch (error) {
            console.error("Failed to initialize user:", error);
          }
        };

        initUser();
      }
    }
  }, [
    userId,
    userData,
    userLoading,
    userError,
    userQueryError,
    authUser,
    queryClient,
  ]);

  const handleOnboardingComplete = (data: WeddingDetails) => {
    updateUserMutation.mutate(
      buildOnboardingUpdatePayload(data, user as OnboardingUser | null),
    );
  };

  // Show skeleton only until user is loaded (quotes load in background to avoid long skeleton)
  const showSkeleton = userLoading;

  if (showSkeleton && activeSection !== "planning") {
    return (
      <DashboardLayout onAddQuote={() => {}} quoteCount={0} showSkeleton>
        <DashboardLoadingState />
      </DashboardLayout>
    );
  }

  // Onboarding UI is not available in this workspace yet; keep dashboard shell visible.
  // TODO: Re-enable once real OnboardingModal is wired.
  void showQuestionnaire;
  void forceShowOnboarding;
  void handleOnboardingComplete;

  const guestCount = user?.weddingProfile?.guestInfo?.estimatedCount || 0;

  return (
    <DashboardLayout onAddQuote={() => openUpload()} quoteCount={quotes.length}>
      <WelcomeBanner />
      <TrialBanner />
      <div className="space-y-6 animate-in fade-in duration-200">
        <DashboardSectionContent
          activeSection={activeSection}
          canAccessCompare={canAccessCompare}
          canAccessComms={canAccessComms}
          showFeatureLocked={showFeatureLocked}
          lockedFeature={lockedFeature}
          onFeatureLockedChange={setShowFeatureLocked}
          onLockedFeatureChange={setLockedFeature}
          onNavigate={setLocation}
          userId={userId}
          quotes={quotes}
          guestCount={guestCount}
          openUpload={openUpload}
          user={user}
          savedPackages={savedPackages}
          weddingOptions={weddingOptions}
          onUserRefresh={() =>
            queryClient.invalidateQueries({
              queryKey: ["/api/users", userId],
            })
          }
          onTestOnboarding={() => setForceShowOnboarding(true)}
        />
      </div>
      <OnboardingTour
        isOpen={showTour}
        onClose={() => {
          setTourDismissed(true);
        }}
        onComplete={async () => {
          setTourDismissed(true);
          if (userId) {
            try {
              await apiRequest(
                "PATCH",
                `/api/users/${userId}/wedding-profile`,
                {
                  tourCompleted: true,
                },
              );
              queryClient.invalidateQueries({
                queryKey: ["/api/users", userId],
              });
            } catch (error) {
              console.error("Failed to save tour completion:", error);
            }
          }
        }}
        onNavigate={(section: string) => {
          if (section === "overview") {
            setLocation("/dashboard");
          } else {
            setLocation(`/dashboard/${section}`);
          }
        }}
      />
    </DashboardLayout>
  );
}
