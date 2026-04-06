import { Check, Crown, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import {
  foundingLifetimeFeatures,
  lifetimeFeatures,
  monthlyFeatures,
} from "../../data/landing";

type PricingSectionProps = {
  ctaHref: string;
  foundingRemaining: number;
  showFounding: boolean;
};

export function PricingSection({
  ctaHref,
  foundingRemaining,
  showFounding,
}: PricingSectionProps) {
  return (
    <section
      id="pricing"
      className="bg-[#fdfbfa] px-4 py-16 sm:px-5 sm:py-20 md:px-8 md:py-24"
    >
      <div className="mx-auto w-full max-w-[1100px]">
        <div className="mb-12 text-center sm:mb-16">
          <div className="mb-3 font-serif text-base italic text-[#D4847A]">
            Simple pricing
          </div>
          <h2 className="mb-4 font-serif text-[clamp(2rem,5vw,2.5rem)] font-semibold leading-tight text-[#2A2035]">
            Pay Once, Plan Forever
          </h2>
          <p className="text-base text-[#6B617B] sm:text-[17px]">
            No monthly-fee traps. Pick lifetime or monthly and keep planning.
          </p>
        </div>

        <div
          className={`mx-auto grid gap-6 ${showFounding ? "max-w-[1100px] md:grid-cols-2 lg:grid-cols-3" : "max-w-[760px] md:grid-cols-2"}`}
        >
          {showFounding && (
            <article className="relative rounded-3xl border-2 border-[#D4847A] bg-white p-7 shadow-[0_8px_40px_rgba(212,132,122,0.15)] sm:p-9">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#D4847A] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-white sm:px-4 sm:text-[11px]">
                Best Value · {foundingRemaining} spots left
              </div>

              <div className="mb-2 flex items-center gap-2">
                <Crown size={18} className="text-[#D4847A]" />
                <h3 className="m-0 font-serif text-2xl font-semibold text-[#2A2035]">
                  Founding Lifetime
                </h3>
              </div>

              <div className="mb-6">
                <span className="font-serif text-4xl font-bold leading-none text-[#2A2035] sm:text-5xl">
                  $19
                </span>
                <span className="ml-2 text-sm text-[#6B617B]">one-time</span>
                <div className="mt-1 text-xs text-[#9B8FA8] line-through">
                  normally $39
                </div>
              </div>

              <ul className="mb-7 space-y-2">
                {foundingLifetimeFeatures.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-sm text-[#4A4458]"
                  >
                    <Check size={14} className="text-[#8BA888]" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                to={ctaHref}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#D4847A] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#C4918A]"
              >
                <Sparkles size={15} />
                Get Founding Lifetime
              </Link>
            </article>
          )}

          <article
            className={`relative rounded-3xl bg-white p-7 shadow-[0_4px_20px_rgba(42,32,53,0.06)] sm:p-9 ${showFounding ? "border border-[#2A20351A]" : "border-2 border-[#D4847A] shadow-[0_8px_40px_rgba(212,132,122,0.15)]"}`}
          >
            {!showFounding && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#D4847A] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-white sm:px-4 sm:text-[11px]">
                Most Popular
              </div>
            )}
            <h3 className="mb-2 font-serif text-2xl font-semibold text-[#2A2035]">
              Lifetime
            </h3>
            <div className="mb-6">
              <span className="font-serif text-4xl font-bold leading-none text-[#2A2035] sm:text-5xl">
                $39
              </span>
              <span className="ml-2 text-sm text-[#6B617B]">one-time</span>
            </div>
            <ul className="mb-7 space-y-2">
              {lifetimeFeatures.map((feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-2 text-sm text-[#4A4458]"
                >
                  <Check size={14} className="text-[#8BA888]" />
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              to={ctaHref}
              className="inline-flex w-full items-center justify-center rounded-full bg-[#2A2035] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#3b3150]"
            >
              Get Lifetime Access
            </Link>
          </article>

          <article className="rounded-3xl border border-[#2A20351A] bg-white p-7 shadow-[0_4px_20px_rgba(42,32,53,0.06)] sm:p-9">
            <h3 className="mb-2 font-serif text-2xl font-semibold text-[#2A2035]">
              Monthly
            </h3>
            <div className="mb-6">
              <span className="font-serif text-4xl font-bold leading-none text-[#2A2035] sm:text-5xl">
                $12
              </span>
              <span className="ml-2 text-sm text-[#6B617B]">/ month</span>
            </div>
            <ul className="mb-7 space-y-2">
              {monthlyFeatures.map((feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-2 text-sm text-[#4A4458]"
                >
                  <Check size={14} className="text-[#8BA888]" />
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              to={ctaHref}
              className="inline-flex w-full items-center justify-center rounded-full border border-[#2A203533] px-4 py-3 text-sm font-bold text-[#2A2035] transition hover:bg-[#F5F0FA]"
            >
              Start Monthly
            </Link>
          </article>
        </div>

        <p className="mt-10 text-center text-sm text-[#9B8FA8]">
          All plans include a free trial. No credit card required to start.
        </p>
      </div>
    </section>
  );
}
