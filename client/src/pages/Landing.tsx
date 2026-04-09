import { useEffect, useState } from "react";

import { DemoSection } from "../components/landing/DemoSection";
import { FaqSection } from "../components/landing/FaqSection";
import { FeaturesSection } from "../components/landing/FeaturesSection";
import { FinalCtaSection } from "../components/landing/FinalCtaSection";
import { HeroSection } from "../components/landing/HeroSection";
import { LandingFooter } from "../components/landing/LandingFooter";
import { LandingNavbar } from "../components/landing/LandingNavbar";
import { PainPointsSection } from "../components/landing/PainPointsSection";
import { PricingSection } from "../components/landing/PricingSection";
import { useFoundingUsers } from "../hooks/useFoundingUsers";
import { useUser } from "../hooks/useUser";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isLoading } = useUser();

  const isLoggedIn = !isLoading && Boolean(user);
  const ctaHref = isLoggedIn ? "/dashboard" : "/signup";
  const ctaLabel = isLoggedIn ? "Go to Dashboard" : "Start Planning Free";

  useEffect(() => {
    document.title =
      "Jovy - Wedding Intelligence Platform | Compare Vendors & Plan Smarter";
  }, []);

  const { data: foundingUsers } = useFoundingUsers();

  const foundingRemaining = foundingUsers?.remaining ?? 0;
  const showFounding = foundingRemaining > 0;

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  return (
    <div className="bg-[#fdfbfa] font-sans text-[#2A2035]">
      <LandingNavbar
        ctaHref={ctaHref}
        ctaLabel={ctaLabel}
        isLoggedIn={isLoggedIn}
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen((value) => !value)}
        onCloseMobileMenu={() => setMobileMenuOpen(false)}
        onNavigateToSection={scrollTo}
      />

      <HeroSection
        ctaHref={ctaHref}
        ctaLabel={ctaLabel}
        onNavigateToFeatures={() => scrollTo("features")}
      />

      <PainPointsSection />
      <FeaturesSection />
      <DemoSection />
      <PricingSection
        ctaHref={ctaHref}
        foundingRemaining={foundingRemaining}
        showFounding={showFounding}
      />
      <FaqSection />
      <FinalCtaSection ctaHref={ctaHref} ctaLabel={ctaLabel} />
      <LandingFooter />
    </div>
  );
}
