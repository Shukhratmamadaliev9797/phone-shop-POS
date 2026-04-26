import type React from "react";
import {
  LayoutDashboard,
  Boxes,
  CreditCard,
  Wallet,
  Landmark,
  Briefcase,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
};

export type NavSection = {
  label: string;
  items: NavItem[];
};

export const navSections: NavSection[] = [
  {
    label: "MENU",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { title: "Inventory", href: "/inventory", icon: Boxes },
      { title: "Sales History", href: "/sales", icon: CreditCard },
      { title: "Debts", href: "/debts", icon: Wallet },
      { title: "Credits", href: "/credits", icon: Landmark },
      { title: "Workers", href: "/workers", icon: Briefcase },
    ],
  },
  {
    label: "GENERAL",
    items: [
      { title: "Settings", href: "/settings", icon: Settings },
      { title: "Help", href: "/help", icon: HelpCircle },
      { title: "Logout", href: "/logout", icon: LogOut },
    ],
  },
];
