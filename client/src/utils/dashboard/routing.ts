import type { DashboardSection } from "@/types/dashboard/dashboard-types";

export function getActiveDashboardSection(pathname: string): DashboardSection {
  if (pathname === "/dashboard" || pathname === "/dashboard/") {
    return "overview";
  }
  if (pathname.startsWith("/dashboard/comms")) return "comms";
  if (pathname.startsWith("/dashboard/quotes")) return "quotes";
  if (pathname.startsWith("/dashboard/compare")) return "compare";
  if (pathname.startsWith("/dashboard/services")) return "services";
  if (pathname.startsWith("/dashboard/settings")) return "settings";
  if (pathname.startsWith("/dashboard/planning")) return "planning";

  return "overview";
}
