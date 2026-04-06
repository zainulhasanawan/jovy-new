export function DemoSection() {
  return (
    <section className="bg-[linear-gradient(180deg,#FDFBFA_0%,#EFE8F5_100%)] px-4 py-16 sm:px-5 sm:py-20 md:px-8 md:py-24">
      <div className="mx-auto w-full max-w-[1200px]">
        <div className="mb-10 text-center sm:mb-12">
          <div className="mb-3 font-serif text-base italic text-[#D4847A]">
            See it in action
          </div>
          <h2 className="mb-4 font-serif text-[clamp(2rem,5vw,2.5rem)] font-semibold leading-tight text-[#2A2035]">
            Your Wedding Command Center
          </h2>
          <p className="text-base text-[#6B617B] sm:text-[17px]">
            Everything visible, nothing lost
          </p>
        </div>

        <div className="relative aspect-video overflow-hidden rounded-3xl border border-[#2A203512] bg-[linear-gradient(160deg,#1C1030_0%,#2A1845_100%)] shadow-[0_32px_100px_rgba(42,32,53,0.14)]">
          <div className="flex h-full flex-col items-center justify-center gap-4 px-4 text-center sm:gap-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/10 sm:h-[72px] sm:w-[72px]">
              <div className="ml-1 h-0 w-0 border-b-[12px] border-l-[20px] border-t-[12px] border-b-transparent border-l-white/80 border-t-transparent sm:border-b-[14px] sm:border-l-[22px] sm:border-t-[14px]" />
            </div>
            <div>
              <div className="mb-1 font-serif text-base text-white/70 sm:text-lg">
                Product walkthrough coming soon
              </div>
              <div className="text-xs text-white/35 sm:text-sm">
                Video coming shortly
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
