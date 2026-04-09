import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  CheckCircle2,
  CreditCard,
  Crown,
  Sparkles,
} from "lucide-react";
import { UpgradeModal } from "./UpgradeModal";
import { useFeatureAccess } from "@/hooks/use-feature-access";
import { apiRequest } from "@/lib/queryClient";

interface PaymentSubscriptionSectionProps {
  userId: string;
}

export function PaymentSubscriptionSection({
  userId,
}: PaymentSubscriptionSectionProps) {
  const {
    status,
    daysRemaining,
    subscriptionType,
    isFoundingUser,
    foundingUserNumber,
  } = useFeatureAccess();
  const navigate = useNavigate();
  const [showUpgrade, setShowUpgrade] = useState(false);

  const { data: foundingUsers } = useQuery<{
    remaining: number;
    total: number;
  }>({
    queryKey: ["/api/founding-users/remaining"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/founding-users/remaining");
      return response.json();
    },
  });

  const getStatusBadge = () => {
    if (status === "active") {
      return (
        <Badge className="bg-[#8BA888] text-white">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Active
        </Badge>
      );
    }

    if (status === "trialing") {
      return (
        <Badge className="bg-[#F2E4E6] text-[#D4847A] border border-[#D4847A]/30">
          <Calendar className="w-3 h-3 mr-1" />
          Trial
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="border-[#9B8FA8] text-[#9B8FA8]">
        Expired
      </Badge>
    );
  };

  const getSubscriptionTypeDisplay = () => {
    if (status === "active") {
      if (subscriptionType === "lifetime") {
        return isFoundingUser ? "Founding Lifetime" : "Lifetime";
      }
      if (subscriptionType === "monthly") {
        return "Monthly";
      }
    }

    if (status === "trialing") {
      return "Free Trial";
    }

    return "Free";
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-[rgba(42,32,53,0.06)] shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-[rgba(42,32,53,0.06)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F8F5FB] flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-[#D4847A]" />
            </div>
            <div>
              <h2 className="font-semibold text-[#2A2035]">
                Payment & Subscription
              </h2>
            </div>
          </div>
          <button
            onClick={() => navigate("/pricing")}
            className="px-4 py-2 rounded-lg border border-[rgba(42,32,53,0.12)] text-[#3D3650] text-sm font-medium hover:bg-[#F8F5FB] transition-colors"
          >
            View Plans
          </button>
        </div>

        <div className="p-5">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[#6B617B]">Status</span>
              {getStatusBadge()}
            </div>

            <div className="flex justify-between">
              <span className="text-[#6B617B]">Plan</span>
              <span className="font-semibold text-[#2A2035]">
                {getSubscriptionTypeDisplay()}
              </span>
            </div>

            {isFoundingUser && foundingUserNumber && (
              <div className="flex justify-between items-center">
                <span className="text-[#6B617B]">Founding User</span>
                <Badge className="bg-[#D4847A] text-white">
                  <Crown className="w-3 h-3 mr-1" />#{foundingUserNumber}
                </Badge>
              </div>
            )}

            {status === "trialing" && (
              <div className="flex justify-between">
                <span className="text-[#6B617B]">Trial Days Remaining</span>
                <span className="font-semibold text-[#2A2035]">
                  {daysRemaining} {daysRemaining === 1 ? "day" : "days"}
                </span>
              </div>
            )}

            {status === "active" && subscriptionType === "monthly" && (
              <div className="flex justify-between">
                <span className="text-[#6B617B]">Billing</span>
                <span className="font-semibold text-[#2A2035]">Monthly</span>
              </div>
            )}

            {status === "active" && subscriptionType === "lifetime" && (
              <div className="flex justify-between">
                <span className="text-[#6B617B]">Billing</span>
                <span className="font-semibold text-[#2A2035]">
                  One-time payment
                </span>
              </div>
            )}

            {(status === "trialing" || status === "expired") && (
              <div className="pt-2 border-t border-[rgba(42,32,53,0.06)]">
                <Button
                  onClick={() => setShowUpgrade(true)}
                  className="w-full bg-[#D4847A] hover:bg-[#C4918A] text-white"
                  size="sm"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Upgrade Now
                </Button>
              </div>
            )}

            {foundingUsers &&
              foundingUsers.remaining > 0 &&
              foundingUsers.remaining <= 10 && (
                <div className="pt-2">
                  <p className="text-xs text-[#D4847A] text-center">
                    ⚡ Only {foundingUsers.remaining} founding spots left!
                  </p>
                </div>
              )}

            <div
              className="text-sm text-[#6B617B]"
              data-testid="billing-user-id"
            >
              User ID: {userId || "Unavailable"}
            </div>
          </div>
        </div>
      </div>

      <UpgradeModal
        open={showUpgrade}
        onOpenChange={setShowUpgrade}
        onSuccess={() => setShowUpgrade(false)}
      />
    </>
  );
}
