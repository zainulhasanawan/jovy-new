import { Check } from "lucide-react";

import { featureCards } from "../../data/landing";

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="bg-[linear-gradient(180deg,#F5F0FA_0%,#FDFBFA_100%)] px-4 py-16 sm:px-5 sm:py-20 md:px-8 md:py-24"
    >
      <div className="mx-auto w-full max-w-[1200px]">
        <div className="mb-12 text-center sm:mb-16">
          <div className="mb-3 font-serif text-base italic text-[#D4847A]">
            Everything in one place
          </div>
          <h2 className="mb-4 font-serif text-[clamp(2rem,5vw,2.5rem)] font-semibold leading-tight text-[#2A2035]">
            Every Tool You Need to Plan Your Wedding
          </h2>
          <p className="mx-auto max-w-2xl text-base text-[#6B617B] sm:text-[17px]">
            Jovy handles the complexity so you can enjoy the planning
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {featureCards.map((card) => (
            <article
              key={card.title}
              className="rounded-3xl border border-[#2A203510] bg-white p-6 shadow-[0_1px_10px_rgba(42,32,53,0.05)] transition duration-150 hover:-translate-y-1 hover:shadow-[0_10px_28px_rgba(42,32,53,0.12)] sm:p-7"
            >
              <div
                className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl ${card.iconBg}`}
              >
                <card.icon size={22} className={card.iconColor} />
              </div>
              <h3 className="mb-2 font-serif text-xl font-semibold text-[#2A2035] sm:text-2xl">
                {card.title}
              </h3>
              <p className="mb-4 text-sm leading-relaxed text-[#6B617B]">
                {card.desc}
              </p>

              <ul className="m-0 space-y-2 p-0">
                {card.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-xs text-[#6B617B] sm:text-[13px]"
                  >
                    <Check size={12} className={card.iconColor} />
                    {feature}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
