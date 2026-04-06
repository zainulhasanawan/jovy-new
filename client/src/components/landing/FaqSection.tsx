import { faqItems } from "../../data/landing";
import { FaqItem } from "./FaqItem";

export function FaqSection() {
  return (
    <section className="bg-[linear-gradient(180deg,#F5F0FA_0%,#FDFBFA_100%)] px-4 py-16 sm:px-5 sm:py-20 md:px-8 md:py-24">
      <div className="mx-auto w-full max-w-[780px]">
        <div className="mb-10 text-center sm:mb-14">
          <div className="mb-3 font-serif text-base italic text-[#D4847A]">
            Got questions?
          </div>
          <h2 className="font-serif text-[clamp(2rem,5vw,2.5rem)] font-semibold leading-tight text-[#2A2035]">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="overflow-hidden rounded-3xl border border-[#2A203512] bg-white/80 shadow-[0_8px_26px_rgba(42,32,53,0.06)] divide-y divide-[#2A203512]">
          {faqItems.map((item) => (
            <FaqItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>
      </div>
    </section>
  );
}
