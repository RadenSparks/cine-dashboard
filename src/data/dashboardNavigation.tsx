import type { LucideIcon } from "lucide-react";
import {
  BadgeDollarSign,
  CalendarDays,
  Film,
  FolderKanban,
  LayoutDashboard,
  Popcorn,
  RectangleEllipsis,
  Settings2,
  Tags,
  Ticket,
  UserRound,
  Users,
} from "lucide-react";

export type DashboardNavItem = {
  name: string;
  path: string;
  icon: LucideIcon;
  description: string;
};

export type DashboardNavSection = {
  label: string;
  items: DashboardNavItem[];
};

export const dashboardNavSections: DashboardNavSection[] = [
  {
    label: "Overview",
    items: [
      {
        name: "Dashboard",
        path: "/",
        icon: LayoutDashboard,
        description: "Operational summary for content, venues, and customer activity.",
      },
    ],
  },
  {
    label: "Catalog",
    items: [
      {
        name: "Movies",
        path: "/movies",
        icon: Film,
        description: "Manage movie records, media, ratings, and release readiness.",
      },
      {
        name: "Genres",
        path: "/genres",
        icon: Tags,
        description: "Organize genre taxonomy and visual labels across the catalog.",
      },
      {
        name: "Media",
        path: "/images",
        icon: FolderKanban,
        description: "Maintain shared artwork, folders, and image placement.",
      },
      {
        name: "Promotions",
        path: "/promotions",
        icon: Popcorn,
        description: "Build and review live campaign offers for moviegoers.",
      },
    ],
  },
  {
    label: "Venue Ops",
    items: [
      {
        name: "Rooms",
        path: "/rooms",
        icon: RectangleEllipsis,
        description: "Configure screening rooms, seating layouts, and venue setup.",
      },
      {
        name: "Sessions",
        path: "/sessions",
        icon: CalendarDays,
        description: "Coordinate showtimes, schedules, and room assignments.",
      },
      {
        name: "Bookings",
        path: "/bookings",
        icon: Ticket,
        description: "Track reservations, seat usage, and session demand.",
      },
      {
        name: "Transactions",
        path: "/transactions",
        icon: BadgeDollarSign,
        description: "Review payment flow, revenue movement, and exceptions.",
      },
    ],
  },
  {
    label: "Administration",
    items: [
      {
        name: "Users",
        path: "/users",
        icon: Users,
        description: "Manage customer and admin accounts, tiers, and access state.",
      },
      {
        name: "Settings",
        path: "/settings",
        icon: Settings2,
        description: "Adjust workspace preferences, appearance, and security surfaces.",
      },
    ],
  },
];

export const dashboardNavItems = dashboardNavSections.flatMap((section) => section.items) as DashboardNavItem[];

export function getNavItemForPath(pathname: string) {
  return dashboardNavItems.find((item) => (item.path === "/" ? pathname === "/" : pathname.startsWith(item.path)));
}

export const dashboardBrand = {
  name: "Cine Dashboard",
  shellLabel: "Cinema operations shell",
  shellDescription: "",
};

export function getRoleLabel(role?: string) {
  if (role === "ADMIN") return "Administrator";
  if (role === "USER") return "Operator";
  return "Dashboard user";
}

export const dashboardFooterCopy = "Cinema operations workspace";

export const headerFallback = {
  icon: UserRound,
  name: "Workspace",
  description: "Unified operations view for the cinema dashboard.",
};
