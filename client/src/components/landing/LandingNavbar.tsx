import { Menu, Star, X } from "lucide-react";
import { Link } from "react-router-dom";

import { navLinks } from "../../data/landing";

type LandingNavbarProps = {
  ctaHref: string;
  ctaLabel: string;
  isLoggedIn: boolean;
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  onCloseMobileMenu: () => void;
  onNavigateToSection: (id: string) => void;
};

export function LandingNavbar({
  ctaHref,
  ctaLabel,
  isLoggedIn,
  mobileMenuOpen,
  onToggleMobileMenu,
  onCloseMobileMenu,
  onNavigateToSection,
}: LandingNavbarProps) {
  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-[#2A203514] bg-[#fdfbfaea] backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between px-4 sm:h-[68px] sm:px-5 md:px-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2"
          aria-label="Jovy home"
        >
          <span className="inline-flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[linear-gradient(135deg,#D4847A,#C4918A)]">
            <Star size={13} className="fill-white text-white" />
          </span>
          <span className="font-serif text-[1.5rem] font-semibold leading-none tracking-[-0.03em] text-[#2A2035]">
            J<span className="text-[#D4847A]">o</span>vy
          </span>
        </Link>

        <div className="hidden items-center gap-10 md:flex">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => onNavigateToSection(link.id)}
              className="text-sm font-medium text-[#6B617B] transition-colors hover:text-[#2A2035]"
            >
              {link.label}
            </button>
          ))}

          {!isLoggedIn && (
            <Link
              to="/login"
              className="rounded-full border border-[#2A2035] px-5 py-2 text-sm font-semibold text-[#2A2035] transition hover:bg-[#2A203507]"
            >
              Log In
            </Link>
          )}

          <Link
            to={ctaHref}
            className="rounded-full bg-[#2A2035] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#3b3150]"
          >
            {ctaLabel}
          </Link>
        </div>

        <button
          className="inline-flex items-center text-[#2A2035] md:hidden"
          onClick={onToggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="flex flex-col gap-4 border-t border-[#2A203510] bg-[#fdfbfa] px-4 py-4 sm:px-5 md:hidden">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => onNavigateToSection(link.id)}
              className="text-left text-base text-[#6B617B]"
            >
              {link.label}
            </button>
          ))}
          <Link
            to={ctaHref}
            className="w-full rounded-full bg-[#2A2035] px-5 py-3 text-center text-base font-semibold text-white"
            onClick={onCloseMobileMenu}
          >
            {ctaLabel}
          </Link>
        </div>
      )}
    </nav>
  );
}
