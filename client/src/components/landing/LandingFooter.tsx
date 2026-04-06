import { Star } from "lucide-react";
import { Link } from "react-router-dom";

import { footerLinks } from "../../data/landing";

export function LandingFooter() {
  return (
    <footer className="bg-[#110D1C] px-4 py-10 sm:px-5 sm:py-12 md:px-8">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
        <Link
          to="/"
          className="inline-flex items-center gap-2"
          aria-label="Jovy home"
        >
          <span className="inline-flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[linear-gradient(135deg,#D4847A,#C4918A)]">
            <Star size={11} className="fill-white text-white" />
          </span>
          <span className="font-serif text-[1.25rem] font-semibold leading-none tracking-[-0.02em] text-white">
            J<span className="text-[#D4847A]">o</span>vy
          </span>
        </Link>

        <p className="m-0 text-sm text-white/30">
          © {new Date().getFullYear()} Jovy. Wedding Intelligence Platform.
        </p>

        <div className="flex gap-5 sm:gap-8">
          {footerLinks.map((item) => (
            <button
              key={item}
              className="border-none bg-transparent p-0 text-sm text-white/40 transition hover:text-white/70"
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </footer>
  );
}
