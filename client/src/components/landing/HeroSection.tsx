import { ArrowRight, Brain, Check, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";

import { heroHighlights } from "../../data/landing";

type HeroSectionProps = {
  ctaHref: string;
  ctaLabel: string;
  onNavigateToFeatures: () => void;
};

export function HeroSection({
  ctaHref,
  ctaLabel,
  onNavigateToFeatures,
}: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(170deg,#EFE8F5_0%,#F9F5FB_30%,#FDFBFA_60%,#FBF6F4_100%)] px-4 pb-16 pt-28 sm:px-5 sm:pb-20 sm:pt-32 md:px-8">
      <div className="pointer-events-none absolute -right-40 -top-20 h-[480px] w-[480px] rounded-full bg-[radial-gradient(circle,rgba(212,132,122,0.15)_0%,rgba(212,132,122,0)_70%)] sm:-right-52 sm:-top-24 sm:h-[700px] sm:w-[700px]" />
      <div className="pointer-events-none absolute -bottom-40 -left-16 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(155,143,168,0.2)_0%,rgba(155,143,168,0)_70%)] sm:-bottom-52 sm:-left-20 sm:h-[600px] sm:w-[600px]" />

      <div className="relative z-10 mx-auto grid w-full max-w-[1200px] gap-10 sm:gap-12 lg:grid-cols-2 lg:items-center">
        <div className="mx-auto w-full max-w-[680px] text-center lg:mx-0 lg:max-w-none lg:text-left">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#D4847A33] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#D4847A] shadow-[0_1px_8px_rgba(42,32,53,0.08)] sm:mb-8 sm:px-4 sm:py-2 sm:text-xs">
            <Brain size={14} />
            Wedding Intelligence Platform
          </div>

          <h1 className="mb-5 font-serif text-4xl md:text-[68px] font-medium leading-[1.02] tracking-[-0.02em] text-[#2A2035] sm:mb-6">
            <span className="text-balance lg:hidden text-5xl">
              Your Complete <em className="text-[#D4847A]">Wedding</em> Planning
              Partner
            </span>
            <span className="hidden lg:inline ">
              Your Complete
              <br />
              <em className="text-[#D4847A]">Wedding</em>
              <br />
              Planning
              <br />
              Partner
            </span>
          </h1>

          <p className="mx-auto mb-8 max-w-[620px] text-balance text-base leading-relaxed text-[#6B617B] sm:mb-10 sm:text-lg lg:mx-0 lg:max-w-[460px]">
            From first vendor outreach to final booking, Jovy keeps every quote,
            conversation, and checklist item organized and actionable.
          </p>

          <div className="mb-8 flex flex-col items-center gap-3 sm:mb-9 sm:flex-row sm:flex-wrap sm:justify-center lg:items-start lg:justify-start">
            <Link
              to={ctaHref}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#2A2035] px-7 py-3.5 text-sm font-bold text-white shadow-[0_4px_16px_rgba(42,32,53,0.3)] transition hover:-translate-y-0.5 hover:bg-[#3b3150] hover:shadow-[0_8px_24px_rgba(42,32,53,0.38)] sm:w-auto sm:px-9 sm:py-4 sm:text-base"
            >
              {ctaLabel} <ArrowRight size={16} />
            </Link>

            <button
              onClick={onNavigateToFeatures}
              className="inline-flex w-full items-center justify-center rounded-full border border-[#D4847A40] bg-[#D4847A14] px-7 py-3.5 text-sm font-medium text-[#D4847A] transition hover:bg-[#D4847A26] sm:w-auto sm:px-8 sm:py-4 sm:text-base"
            >
              See How It Works
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3 lg:justify-start">
            {heroHighlights.map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 text-xs text-[#6B617B]"
              >
                <span className="inline-flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#8BA88833]">
                  <Check size={10} className="text-[#8BA888]" />
                </span>
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-auto hidden w-full max-w-[580px] lg:block lg:max-w-none">
          <div className="overflow-hidden rounded-[28px] shadow-[0_24px_80px_rgba(42,32,53,0.18),0_4px_16px_rgba(42,32,53,0.08)]">
            <img
              src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&h=700"
              alt="Wedding celebration"
              className="h-auto w-full"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#2A203559] via-transparent to-transparent" />
          </div>

          <div className="absolute right-3 top-3 rounded-2xl border border-[#2A203510] bg-white px-4 py-3 shadow-[0_8px_32px_rgba(42,32,53,0.14)] sm:right-4 sm:top-4 md:-right-4 md:top-5 md:px-5 md:py-4">
            <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#9B8FA8] md:text-[11px]">
              Coverage Score
            </div>
            <div className="font-serif text-3xl font-semibold leading-none text-[#2A2035] md:text-4xl">
              87%
            </div>
            <div className="mt-1 text-[11px] text-[#6B617B] md:text-xs">
              Silverado Resort
            </div>
          </div>

          <div className="absolute -bottom-4 left-3 flex items-center gap-3 rounded-2xl border border-[#2A203512] bg-white px-3 py-2.5 shadow-[0_8px_32px_rgba(42,32,53,0.12)] sm:left-4 sm:px-4 sm:py-3 md:-bottom-5 md:-left-4">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#EFE8F5,#E4D9EE)] sm:h-10 sm:w-10">
              <MessageSquare
                size={16}
                className="text-[#D4847A] sm:h-[17px] sm:w-[17px]"
              />
            </span>
            <div>
              <p className="m-0 text-xs font-bold text-[#2A2035] sm:text-sm">
                6 vendors contacted
              </p>
              <p className="m-0 text-[11px] text-[#6B617B] sm:text-xs">
                2 quotes received · 1 booked
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
