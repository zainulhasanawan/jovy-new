import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useUser } from "../../hooks/useUser.js";

export type AccessStatus = "trialing" | "active" | "expired";

interface SubscriptionStatus {
  status: AccessStatus;
  daysRemaining: number;
  subscriptionType: "none" | "lifetime" | "monthly";
  isFoundingUser: boolean;
  foundingUserNumber: number | null;
}

interface FeatureAccess {
  canAccessCompare: boolean;
  canAccessComms: boolean;
  canUploadQuotes: boolean;
  requireUpgrade: (feature: "compare" | "comms" | "upload") => boolean;
  status: AccessStatus;
  subscriptionStatus: SubscriptionStatus | null;
  subscriptionType: "none" | "lifetime" | "monthly";
  daysRemaining: number;
  isFoundingUser: boolean;
  foundingUserNumber: number | null;
  isLoading: boolean;
  quoteCount: number;
}

export function useFeatureAccess(): FeatureAccess {
  const { user } = useUser();

  const { data: subscriptionStatus, isLoading: isLoadingStatus } =
    useQuery<SubscriptionStatus | null>({
      queryKey: ["/api/user/subscription-status", user?.id],
      queryFn: async () => {
        if (!user?.id) return null;
        try {
          const response = await apiRequest(
            "GET",
            `/api/user/subscription-status?userId=${user.id}`,
          );
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            return response.json();
          } else {
            console.warn("Subscription status API returned non-JSON response");
            // Fail-open: default to trialing so new users are never locked out on load errors
            return {
              status: "trialing" as AccessStatus,
              daysRemaining: 14,
              subscriptionType: "none" as const,
              isFoundingUser: false,
              foundingUserNumber: null,
            };
          }
        } catch (error) {
          console.error("Error fetching subscription status:", error);
          return {
            status: "trialing" as AccessStatus,
            daysRemaining: 14,
            subscriptionType: "none" as const,
            isFoundingUser: false,
            foundingUserNumber: null,
          };
        }
      },
      enabled: !!user?.id,
      retry: 1,
    });

  const { data: quoteCount = 0 } = useQuery<number>({
    queryKey: ["/api/quotes", user?.id, "count"],
    queryFn: async () => {
      if (!user?.id) return 0;
      const response = await apiRequest("GET", `/api/quotes?userId=${user.id}`);
      const quotes = await response.json();
      return Array.isArray(quotes) ? quotes.length : 0;
    },
    enabled: !!user?.id,
  });

  // Default to 'trialing' while loading OR when no user yet — never lock out on initial render
  const status: AccessStatus =
    subscriptionStatus?.status ||
    (isLoadingStatus || !user?.id ? "trialing" : "expired");

  const canAccessCompare = status === "trialing" || status === "active";
  const canAccessComms = status === "trialing" || status === "active";
  const canUploadQuotes =
    status === "trialing" ||
    status === "active" ||
    (status === "expired" && quoteCount < 3);

  const requireUpgrade = (feature: "compare" | "comms" | "upload"): boolean => {
    if (feature === "compare" && !canAccessCompare) return true;
    if (feature === "comms" && !canAccessComms) return true;
    if (feature === "upload" && !canUploadQuotes) return true;
    return false;
  };

  // Extract subscription details for easier access
  const subscriptionType = subscriptionStatus?.subscriptionType || "none";
  const daysRemaining = subscriptionStatus?.daysRemaining || 0;
  const isFoundingUser = subscriptionStatus?.isFoundingUser || false;
  const foundingUserNumber = subscriptionStatus?.foundingUserNumber || null;

  return {
    canAccessCompare,
    canAccessComms,
    canUploadQuotes,
    requireUpgrade,
    status,
    subscriptionStatus: subscriptionStatus || null,
    subscriptionType,
    daysRemaining,
    isFoundingUser,
    foundingUserNumber,
    isLoading: isLoadingStatus,
    quoteCount,
  };
}
