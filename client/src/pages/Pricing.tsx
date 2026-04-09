import {
  Check,
  Crown,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Star,
} from "lucide-react";
import { Link } from "react-router-dom";

import { useFoundingUsers } from "../hooks/useFoundingUsers";
import { useUser } from "../hooks/useUser";

type SubscriptionSnapshot = {
  status: "active" | "trialing" | "free";
  daysRemaining: number;
  subscriptionType: "lifetime" | "monthly" | null;
  isFoundingUser: boolean;
};

function getSubscriptionSnapshot(): SubscriptionSnapshot {
  // TODO: Replace with real subscription status once backend endpoint is finalized.
  return {
    status: "free",
    daysRemaining: 14,
    subscriptionType: null,
    isFoundingUser: false,
  };
}

export default function PricingPage() {
  const { user } = useUser();
  const { data: foundingUsers } = useFoundingUsers();

  const showFoundingPricing = (foundingUsers?.remaining ?? 0) > 0;
  const { status, daysRemaining, subscriptionType, isFoundingUser } =
    getSubscriptionSnapshot();

  const getCurrentPlanBadge = () => {
    if (status === "active") {
      return (
        <span className="inline-flex items-center rounded-full bg-[#8BA888] px-3 py-1 text-xs font-semibold text-white">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Current Plan
        </span>
      );
    }

    if (status === "trialing") {
      return (
        <span className="inline-flex items-center rounded-full border border-[#D4847A]/30 bg-[#F2E4E6] px-3 py-1 text-xs font-semibold text-[#D4847A]">
          <Calendar className="mr-1 h-3 w-3" />
          Trial ({daysRemaining} days left)
        </span>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-[#F8F5FB] font-sans">
      <div className="border-b border-[rgba(42,32,53,0.06)] bg-white">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-sm font-medium text-[#6B617B] transition hover:text-[#D4847A]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-2"
            aria-label="Jovy home"
          >
            <span className="inline-flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[linear-gradient(135deg,#D4847A,#C4918A)]">
              <Star size={11} className="fill-white text-white" />
            </span>
            <span className="font-serif text-[1.25rem] font-semibold leading-none tracking-[-0.02em] text-[#2A2035]">
              J<span className="text-[#D4847A]">o</span>vy
            </span>
          </Link>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-6 py-12">
        <div className="mb-12 text-center">
          <h1 className="mb-4 font-serif text-4xl font-bold text-[#2A2035]">
            Choose Your Plan
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-[#6B617B]">
            Unlock the full power of Jovy with unlimited access to all features
          </p>
        </div>

        {user && (
          <div className="mb-8 rounded-xl border border-[rgba(42,32,53,0.06)] bg-white p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-[#6B617B]">Your current plan</p>
                <p className="font-semibold text-[#2A2035]">
                  {status === "active"
                    ? `${subscriptionType === "lifetime" ? (isFoundingUser ? "Founding Lifetime" : "Lifetime") : "Monthly"} Plan`
                    : status === "trialing"
                      ? `Free Trial (${daysRemaining} days remaining)`
                      : "Free Plan"}
                </p>
              </div>
              {getCurrentPlanBadge()}
            </div>
          </div>
        )}

        <div
          className={`mb-8 grid gap-6 ${showFoundingPricing ? "md:grid-cols-3" : "md:grid-cols-2"}`}
        >
          {showFoundingPricing && (
            <article className="relative rounded-2xl border-2 border-[#D4847A] bg-white p-8 shadow-lg">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#D4847A] px-3 py-1 text-xs font-semibold text-white">
                BEST VALUE
              </span>

              <div className="mb-6 text-center">
                <div className="mb-2 flex items-center justify-center gap-2">
                  <h3 className="font-serif text-2xl font-bold text-[#2A2035]">
                    Founding Lifetime
                  </h3>
                  {isFoundingUser && subscriptionType === "lifetime" && (
                    <Crown className="h-5 w-5 text-[#D4847A]" />
                  )}
                </div>
                <div className="mb-2 font-serif text-5xl font-bold text-[#2A2035]">
                  $19
                </div>
                <div className="text-sm text-[#6B617B]">one-time payment</div>
                <div className="mt-1 text-xs text-[#6B617B]">
                  (normally $39)
                </div>
                <p className="mt-2 text-sm font-medium text-[#D4847A]">
                  ⚡ Only {foundingUsers?.remaining} spots remaining!
                </p>
              </div>

              <ul className="mb-6 space-y-3">
                {[
                  "Lifetime access to all features",
                  "Unlimited quote uploads",
                  "AI-powered vendor comparison",
                  "Communication assistant",
                  "All future updates included",
                  "Exclusive founding user badge",
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#8BA888]" />
                    <span className="text-sm text-[#2A2035]">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className="inline-flex w-full items-center justify-center rounded-lg bg-[#D4847A] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#C4918A]"
                type="button"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Get Founding Lifetime
              </button>
            </article>
          )}

          <article
            className={`relative rounded-2xl border-2 bg-white p-8 ${showFoundingPricing ? "border-[#E4D9EE]" : "border-[#D4847A]"}`}
          >
            {!showFoundingPricing && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#D4847A] px-3 py-1 text-xs font-semibold text-white">
                BEST VALUE
              </span>
            )}

            <div className="mb-6 text-center">
              <h3 className="mb-2 font-serif text-2xl font-bold text-[#2A2035]">
                Lifetime
              </h3>
              <div className="mb-2 font-serif text-5xl font-bold text-[#2A2035]">
                $39
              </div>
              <div className="text-sm text-[#6B617B]">one-time payment</div>
            </div>

            <ul className="mb-6 space-y-3">
              {[
                "Lifetime access to all features",
                "Unlimited quote uploads",
                "AI-powered vendor comparison",
                "Communication assistant",
                "All future updates included",
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#8BA888]" />
                  <span className="text-sm text-[#2A2035]">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              className={`inline-flex w-full items-center justify-center rounded-lg px-4 py-3 text-sm font-semibold text-white transition ${showFoundingPricing ? "bg-[#2A2035] hover:bg-[#3D3650]" : "bg-[#D4847A] hover:bg-[#C4918A]"}`}
              type="button"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Get Lifetime
            </button>
          </article>

          <article className="rounded-2xl border border-[#E4D9EE] bg-white p-8">
            <div className="mb-6 text-center">
              <h3 className="mb-2 font-serif text-2xl font-bold text-[#2A2035]">
                Monthly
              </h3>
              <div className="mb-2 font-serif text-5xl font-bold text-[#2A2035]">
                $12
              </div>
              <div className="text-sm text-[#6B617B]">per month</div>
            </div>

            <ul className="mb-6 space-y-3">
              {[
                "Full access to all features",
                "Unlimited quote uploads",
                "AI-powered vendor comparison",
                "Communication assistant",
                "Cancel anytime",
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#8BA888]" />
                  <span className="text-sm text-[#2A2035]">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              className="inline-flex w-full items-center justify-center rounded-lg border-2 border-[#E4D9EE] px-4 py-3 text-sm font-semibold text-[#2A2035] transition hover:bg-[#F8F5FB]"
              type="button"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Subscribe
            </button>
          </article>
        </div>

        <div className="rounded-2xl border border-[rgba(42,32,53,0.06)] bg-white p-8">
          <h2 className="mb-6 font-serif text-2xl font-bold text-[#2A2035]">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="mb-2 font-semibold text-[#2A2035]">
                What&apos;s included in the trial?
              </h3>
              <p className="text-[#6B617B]">
                Your 14-day free trial includes full access to all features:
                unlimited quote uploads, AI-powered comparison, and
                communication assistant.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-[#2A2035]">
                What is founding user pricing?
              </h3>
              <p className="text-[#6B617B]">
                Founding user pricing is a limited-time offer for early users.
                Get lifetime access for just $19 (normally $39) and receive an
                exclusive founding user badge.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-[#2A2035]">
                Can I cancel my subscription?
              </h3>
              <p className="text-[#6B617B]">
                Yes, monthly subscriptions can be cancelled anytime. Lifetime
                plans are one-time payments with no recurring charges.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
