import { LogOut, Settings, CreditCard, Menu, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useUser } from "@/hooks/useUser";

interface TopBarProps {
  onAddQuote?: () => void;
  // When true (e.g. overview loading), show skeleton in header instead of real content
  showSkeleton?: boolean;
  // Mobile: open sidebar drawer (hamburger)
  onMenuClick?: () => void;
}

export function TopBar({
  onAddQuote,
  showSkeleton = false,
  onMenuClick,
}: TopBarProps) {
  const { user } = useUser();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const rawName = ((user?.user_metadata as { name?: string } | undefined)
    ?.name ||
    user?.email ||
    "") as string;
  const nameParts = rawName ? rawName.trim().split(/\s+/).slice(0, 2) : [];
  const initials =
    nameParts
      .map((part) => (part && part.length > 0 ? part[0].toUpperCase() : ""))
      .join("") || "JV";

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  if (showSkeleton) {
    return (
      <header className="top-bar">
        <div className="top-bar-left" />
        <div className="top-bar-right">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
      </header>
    );
  }

  return (
    <header className="top-bar">
      <div className="top-bar-left">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            className="top-bar-menu-btn"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}
      </div>

      <div className="top-bar-right">
        {onAddQuote && (
          <Button
            onClick={onAddQuote}
            data-testid="button-add-quote-topbar"
            className="add-quote-btn"
          >
            <Plus className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Add Quote</span>
          </Button>
        )}

        <button
          type="button"
          onClick={() => navigate("/dashboard/settings")}
          className="top-bar-action"
          aria-label="Settings"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => navigate("/pricing")}
          className="top-bar-action"
          aria-label="Billing & Plans"
          title="Billing & Plans"
        >
          <CreditCard className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => navigate("/dashboard/settings")}
          className="user-menu"
          aria-label="Open settings"
          title={rawName || "Jovy user"}
        >
          <div className="user-avatar">{initials}</div>
        </button>

        <button
          type="button"
          onClick={handleSignOut}
          className="top-bar-action"
          aria-label="Log out"
          title="Log out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
