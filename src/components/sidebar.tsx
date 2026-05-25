"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  PenSquare,
  BarChart3,
  Users,
  Zap,
  Settings,
  Bell,
  CalendarClock,
} from "lucide-react";

const navItems = [
  { href: "/dashboard",  label: "Dashboard",  icon: LayoutDashboard },
  { href: "/compose",    label: "Compose",     icon: PenSquare },
  { href: "/scheduled",  label: "Scheduled",   icon: CalendarClock },
  { href: "/analytics",  label: "Analytics",   icon: BarChart3 },
  { href: "/accounts",   label: "Accounts",    icon: Users },
];

const bottomItems = [
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[#0d0d14] border-r border-white/5 flex flex-col z-50">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-none">SocialHub</p>
            <p className="text-white/40 text-xs mt-0.5">Manage everywhere</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group",
                active
                  ? "bg-gradient-to-r from-violet-600/20 to-indigo-600/10 text-white border border-violet-500/20"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon
                className={cn(
                  "w-4.5 h-4.5 shrink-0",
                  active ? "text-violet-400" : "text-white/40 group-hover:text-white/70"
                )}
                size={18}
              />
              {label}
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Compose CTA */}
      <div className="px-4 py-3">
        <Link
          href="/compose"
          className="block w-full py-2.5 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl text-center transition-all duration-150 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40"
        >
          + New Post
        </Link>
      </div>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-white/5 space-y-0.5">
        {bottomItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:text-white hover:bg-white/5 transition-all duration-150 group"
          >
            <Icon className="w-4.5 h-4.5 shrink-0 group-hover:text-white/70" size={18} />
            {label}
          </Link>
        ))}

        {/* User */}
        <div className="flex items-center gap-3 px-3 py-2.5 mt-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
            SH
          </div>
          <div className="min-w-0">
            <p className="text-white/80 text-sm font-medium truncate">SocialHub</p>
            <p className="text-white/30 text-xs truncate">Pro Plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
