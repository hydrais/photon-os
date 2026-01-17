import { NavLink } from "react-router";
import { Sparkles, Search, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/discover", icon: Sparkles, label: "Discover" },
  { to: "/search", icon: Search, label: "Search" },
  { to: "/more", icon: Menu, label: "More" },
] as const;

export function TabBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t border-border pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-12">
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-0.5 text-xs transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )
            }
          >
            <Icon className="size-5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
