import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import { ctaSteps } from "../../data/landing";

type FinalCtaSectionProps = {
  ctaHref: string;
  ctaLabel: string;
};

export function FinalCtaSection({ ctaHref, ctaLabel }: FinalCtaSectionProps) {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(160deg,#2A2035_0%,#1A102B_100%)] px-4 py-20 sm:px-5 sm:py-24 md:px-8 md:py-28">
      <div className="pointer-events-none absolute -right-24 -top-24 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(212,132,122,0.15)_0%,transparent_70%)]" />

      <div className="relative z-10 mx-auto w-full max-w-[820px] text-center">
        <div className="mb-4 font-serif text-base italic text-[#D4847A] sm:text-lg">
          Ready to start?
        </div>
        <h2 className="mb-4 font-serif text-[clamp(2rem,8vw,3.5rem)] font-medium leading-[1.08] text-white">
          Plan Your Wedding, Not Your Spreadsheets
        </h2>
        <p className="mx-auto mb-10 max-w-[660px] text-base text-white/65 sm:mb-12 sm:text-lg">
          Quotes, vendor comms, coverage tracking, and checklist workflows in
          one place.
        </p>

        <div className="mb-12 grid gap-4 md:grid-cols-3">
          {ctaSteps.map((item) => (
            <Link to={ctaHref} key={item.title}>
              <article className="h-full rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:-translate-y-1 hover:border-[#D4847A66] hover:bg-white/10 sm:p-7">
                <span className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#D4847A26]">
                  <item.icon size={23} className="text-[#D4847A]" />
                </span>
                <h3 className="mb-1 font-serif text-xl font-semibold text-white">
                  {item.title}
                </h3>
                <p className="text-sm text-white/55">{item.desc}</p>
              </article>
            </Link>
          ))}
        </div>

        <Link
          to={ctaHref}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-8 py-3.5 text-base font-bold text-[#2A2035] shadow-[0_4px_24px_rgba(0,0,0,0.2)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.25)] sm:w-auto sm:px-12 sm:py-4 sm:text-[17px]"
        >
          {ctaLabel} <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}
