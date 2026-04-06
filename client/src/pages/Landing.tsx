import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { DemoSection } from "../components/landing/DemoSection";
import { FaqSection } from "../components/landing/FaqSection";
import { FeaturesSection } from "../components/landing/FeaturesSection";
import { FinalCtaSection } from "../components/landing/FinalCtaSection";
import { HeroSection } from "../components/landing/HeroSection";
import { LandingFooter } from "../components/landing/LandingFooter";
import { LandingNavbar } from "../components/landing/LandingNavbar";
import { PainPointsSection } from "../components/landing/PainPointsSection";
import { PricingSection } from "../components/landing/PricingSection";
import { useUser } from "../hooks/useUser";

type FoundingUsersResponse = {
  remaining: number;
  total: number;
};

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

  const { data: foundingUsers } = useQuery<FoundingUsersResponse>({
    queryKey: ["founding-users-remaining"],
    queryFn: async () => {
      const response = await fetch("/api/founding-users/remaining");
      if (!response.ok) {
        return { remaining: 0, total: 0 };
      }
      return response.json();
    },
    retry: false,
    staleTime: 30_000,
  });

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
