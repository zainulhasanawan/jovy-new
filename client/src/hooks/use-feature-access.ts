export type SubscriptionStatus = "active" | "trialing" | "expired";
export type SubscriptionType = "lifetime" | "monthly" | null;

interface FeatureAccessState {
  subscriptionStatus: SubscriptionStatus;
  status: SubscriptionStatus;
  daysRemaining: number;
  subscriptionType: SubscriptionType;
  isFoundingUser: boolean;
  foundingUserNumber: number | null;
}

export function useFeatureAccess(): FeatureAccessState {
  // Workspace fallback until billing backend is wired.
  return {
    subscriptionStatus: "trialing",
    status: "trialing",
    daysRemaining: 14,
    subscriptionType: null,
    isFoundingUser: false,
    foundingUserNumber: null,
  };
}
