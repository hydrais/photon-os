import { Link } from "react-router";
import { ChevronRight, History, RefreshCw, Plus, LayoutDashboard, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDeveloperProfile } from "@/hooks/useDeveloperProfile";

function MenuItem({
  to,
  icon: Icon,
  label,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 py-3 hover:bg-muted/50 -mx-4 px-4 transition-colors"
    >
      <Icon className="size-5 text-muted-foreground" />
      <span className="flex-1">{label}</span>
      <ChevronRight className="size-5 text-muted-foreground" />
    </Link>
  );
}

export function MoreScreen() {
  const { hasProfile, loading } = useDeveloperProfile();

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-6">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold">More</h1>
        </header>

        {/* Your Apps Section */}
        <section className="mb-8">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
            Your Apps
          </h2>
          <div className="divide-y divide-border">
            <MenuItem to="/more/history" icon={History} label="Install History" />
            <MenuItem to="/more/updates" icon={RefreshCw} label="Recent Updates" />
          </div>
        </section>

        {/* Developer Section */}
        <section>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
            Developer
          </h2>
          {loading ? (
            <div className="py-4 text-muted-foreground">Loading...</div>
          ) : hasProfile ? (
            <div className="divide-y divide-border">
              <MenuItem to="/dashboard" icon={LayoutDashboard} label="My Apps" />
              <MenuItem to="/submit" icon={Plus} label="Submit New App" />
              <MenuItem to="/profile/edit" icon={User} label="Edit Profile" />
            </div>
          ) : (
            <div className="py-4">
              <p className="text-muted-foreground mb-4">
                Create a developer profile to publish apps to the store.
              </p>
              <Button asChild>
                <Link to="/profile/setup">Start Publishing</Link>
              </Button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
