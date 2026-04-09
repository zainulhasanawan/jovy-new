import { type ReactNode, useEffect, useState } from "react";

import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
  onAddQuote?: () => void;
  quoteCount?: number;
  showSkeleton?: boolean;
}

export function DashboardLayout({
  children,
  onAddQuote,
  quoteCount = 0,
  showSkeleton = false,
}: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <div className={cn("dashboard-layout", mobileMenuOpen && "sidebar-open")}>
      {mobileMenuOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden
        />
      )}

      <Sidebar
        quoteCount={quoteCount}
        showSkeleton={showSkeleton}
        onNavigate={() => setMobileMenuOpen(false)}
      />

      <main className="main-content">
        <TopBar
          onAddQuote={onAddQuote}
          showSkeleton={showSkeleton}
          onMenuClick={() => setMobileMenuOpen(true)}
        />

        <div className="content-area">{children}</div>
      </main>
    </div>
  );
}
