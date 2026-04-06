import { useState } from "react";

type FaqItemProps = {
  q: string;
  a: string;
};

export function FaqItem({ q, a }: FaqItemProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white transition-colors duration-200 hover:bg-white/95">
      <button
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left sm:px-7 sm:py-6"
      >
        <span className="font-serif text-base font-semibold leading-tight text-[#2A2035] sm:text-lg">
          {q}
        </span>
        <span className="relative inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#D4847A4D] text-[#D4847A]">
          <span className="absolute h-[1.5px] w-3.5 bg-current" />
          <span
            className={`absolute h-3.5 w-[1.5px] bg-current transition-transform duration-200 ${open ? "scale-y-0" : "scale-y-100"}`}
          />
        </span>
      </button>

      <div
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
      >
        <div className="overflow-hidden">
          <div className="px-5 pb-5 sm:px-7 sm:pb-6">
            <p className="m-0 text-sm leading-relaxed text-[#6B617B] sm:text-[15px]">
              {a}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
