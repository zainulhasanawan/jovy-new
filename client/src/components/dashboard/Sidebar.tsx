import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  FileText,
  Columns,
  CheckSquare,
  Settings,
  MessageSquare,
  ClipboardList,
  LogOut,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { apiRequest } from "@/lib/queryClient";
import type { DateInfo } from "@/types/dashboard/schema";
import { useAuth } from "@/contexts/AuthContext";
import { useUser } from "@/hooks/useUser";
import { Skeleton } from "@/components/ui/skeleton";

interface SidebarProps {
  quoteCount?: number;
  // When true (e.g. overview loading), show skeleton loaders for all sidebar content
  showSkeleton?: boolean;
  // Called when user navigates (e.g. close mobile drawer after link click)
  onNavigate?: () => void;
}

type SidebarUser = {
  name?: string;
  partnerName?: string;
  weddingDate?: string;
  weddingProfile?: {
    partner1Name?: string;
    partner2Name?: string;
    dateInfo?: DateInfo;
    timeline?: {
      weddingDate?: string;
    };
  };
};

function formatFlexibleDate(dateInfo: DateInfo | undefined): string | null {
  if (!dateInfo) return null;

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  switch (dateInfo.dateType) {
    case "specific":
      if (!dateInfo.specificDate) return null;
      return new Date(dateInfo.specificDate).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    case "month":
      if (!dateInfo.month || !dateInfo.year) return null;
      return `${months[dateInfo.month - 1]} ${dateInfo.year}`;
    case "season":
      if (!dateInfo.season || !dateInfo.year) return null;
      return `${dateInfo.season.charAt(0).toUpperCase() + dateInfo.season.slice(1)} ${dateInfo.year}`;
    case "year":
      return dateInfo.year ? `${dateInfo.year}` : null;
    case "undecided":
      return "Date undecided";
    default:
      return null;
  }
}

export function Sidebar({
  quoteCount = 0,
  showSkeleton: overviewSkeleton = false,
  onNavigate,
}: SidebarProps) {
  const navigate = useNavigate();
  const { user: authUser, isLoading: authLoading } = useUser();
  const { signOut } = useAuth();
  const userId = authUser?.id || "";

  const { data: userData, isLoading: userLoading } =
    useQuery<SidebarUser | null>({
      queryKey: ["/api/users", userId, "sidebar"],
      enabled: !!userId,
      queryFn: async () => {
        try {
          const response = await apiRequest("GET", `/api/users/${userId}`);
          return (await response.json()) as SidebarUser;
        } catch {
          return null;
        }
      },
    });

  // Keep sidebar usable even if profile fetch fails
  const showSkeleton =
    overviewSkeleton || authLoading || (userLoading && !!userId);

  const partner1 =
    userData?.weddingProfile?.partner1Name ||
    userData?.name?.split(" & ")[0] ||
    "";
  const partner2 =
    userData?.weddingProfile?.partner2Name ||
    userData?.partnerName ||
    userData?.name?.split(" & ")[1] ||
    "";
  const coupleNames =
    partner1 && partner2
      ? `${partner1} & ${partner2}`
      : partner1 || partner2 || "Your Wedding";

  const dateInfo = userData?.weddingProfile?.dateInfo;
  const legacyDateStr =
    userData?.weddingProfile?.timeline?.weddingDate || userData?.weddingDate;

  const weddingDate =
    formatFlexibleDate(dateInfo) ||
    (legacyDateStr
      ? new Date(legacyDateStr).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : null);

  const navItems = [
    { id: "overview", label: "Overview", icon: Home, path: "/dashboard" },
    {
      id: "comms",
      label: "Comms",
      icon: MessageSquare,
      path: "/dashboard/comms",
    },
    {
      id: "quotes",
      label: "Quotes",
      icon: FileText,
      path: "/dashboard/quotes",
      badge: quoteCount > 0 ? quoteCount : undefined,
    },
    {
      id: "compare",
      label: "Compare",
      icon: Columns,
      path: "/dashboard/compare",
    },
  ];

  const secondaryItems = [
    {
      id: "planning",
      label: "Planning",
      icon: ClipboardList,
      path: "/dashboard/planning",
    },
    {
      id: "services",
      label: "Services",
      icon: CheckSquare,
      path: "/dashboard/services",
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      path: "/dashboard/settings",
    },
  ];

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        {showSkeleton ? (
          <Skeleton className="h-8 w-24 rounded" aria-hidden />
        ) : (
          <Link to="/dashboard" className="sidebar-logo" onClick={onNavigate}>
            <img src="/Jovy-logo.png" alt="Jovy" />
          </Link>
        )}
      </div>

      <div className="sidebar-wedding-info">
        {showSkeleton ? (
          <>
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-3 w-24" />
          </>
        ) : (
          <>
            <p className="wedding-names">{coupleNames}</p>
            {weddingDate && <p className="wedding-date">{weddingDate}</p>}
          </>
        )}
      </div>

      <nav className="sidebar-nav">
        {showSkeleton
          ? navItems.map((item) => (
              <div
                key={item.id}
                className="sidebar-item opacity-70 pointer-events-none"
                aria-hidden
              >
                <Skeleton className="w-5 h-5 rounded" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))
          : navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  end={item.path === "/dashboard"}
                  className={({ isActive }) =>
                    `sidebar-item ${isActive ? "active" : ""}`
                  }
                  data-testid={`nav-${item.id}`}
                  data-tour={item.id}
                  onClick={onNavigate}
                >
                  <span className="sidebar-item-icon">
                    <Icon className="w-5 h-5" />
                  </span>
                  <span className="sidebar-item-label">{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="sidebar-item-badge">{item.badge}</span>
                  )}
                </NavLink>
              );
            })}
      </nav>

      <div className="sidebar-divider" />

      <nav className="sidebar-nav secondary">
        {showSkeleton
          ? secondaryItems.map((item) => (
              <div
                key={item.id}
                className="sidebar-item opacity-70 pointer-events-none"
                aria-hidden
              >
                <Skeleton className="w-5 h-5 rounded" />
                <Skeleton className="h-4 w-14" />
              </div>
            ))
          : secondaryItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  className={({ isActive }) =>
                    `sidebar-item ${isActive ? "active" : ""}`
                  }
                  data-testid={`nav-${item.id}`}
                  data-tour={item.id}
                  onClick={onNavigate}
                >
                  <span className="sidebar-item-icon">
                    <Icon className="w-5 h-5" />
                  </span>
                  <span className="sidebar-item-label">{item.label}</span>
                </NavLink>
              );
            })}
      </nav>

      <div className="sidebar-spacer" />

      <div className="sidebar-footer">
        {showSkeleton ? (
          <div
            className="sidebar-item opacity-70 pointer-events-none"
            aria-hidden
          >
            <Skeleton className="w-5 h-5 rounded" />
            <Skeleton className="h-4 w-14" />
          </div>
        ) : (
          <button
            type="button"
            onClick={handleLogout}
            className="sidebar-item sidebar-logout"
            data-testid="nav-logout"
          >
            <span className="sidebar-item-icon">
              <LogOut className="w-5 h-5" />
            </span>
            <span className="sidebar-item-label">Log out</span>
          </button>
        )}
      </div>
    </aside>
  );
}
