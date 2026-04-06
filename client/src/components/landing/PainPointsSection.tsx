import { painPoints } from "../../data/landing";

export function PainPointsSection() {
  return (
    <section className="bg-[#fdfbfa] px-4 py-16 sm:px-5 sm:py-20 md:px-8 md:py-24">
      <div className="mx-auto w-full max-w-[1200px]">
        <div className="mb-12 text-center sm:mb-16">
          <div className="mb-3 font-serif text-base italic text-[#D4847A]">
            Sound familiar?
          </div>
          <h2 className="font-serif text-[clamp(2rem,5vw,2.5rem)] font-semibold leading-tight text-[#2A2035]">
            Wedding Planning Has Too Many Moving Parts
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {painPoints.map((card) => (
            <article
              key={card.title}
              className={`rounded-3xl border p-6 transition duration-150 hover:-translate-y-1 sm:p-8 ${card.cardBg} ${card.border}`}
            >
              <div
                className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl sm:mb-6 sm:h-14 sm:w-14 ${card.iconBg}`}
              >
                <card.icon size={24} className={card.iconColor} />
              </div>
              <h3 className="mb-2 font-serif text-xl font-semibold text-[#2A2035] sm:text-2xl">
                {card.title}
              </h3>
              <p className="m-0 text-[15px] leading-relaxed text-[#6B617B]">
                {card.desc}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
