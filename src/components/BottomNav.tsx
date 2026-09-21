import { Link } from "@tanstack/react-router";
import { Home, Target, BookOpen, Calculator, Menu } from "lucide-react";

const items = [
  { to: "/", label: "Home", Icon: Home, exact: true },
  { to: "/plan", label: "Plan", Icon: Target },
  { to: "/journal", label: "Journal", Icon: BookOpen },
  { to: "/tools", label: "Tools", Icon: Calculator },
  { to: "/more", label: "More", Icon: Menu },
] as const;

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur">
      <div className="mx-auto grid max-w-md grid-cols-5">
        {items.map(({ to, label, Icon, exact }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: !!exact }}
            className="flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium text-muted-foreground"
            activeProps={{ className: "!text-primary" }}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
