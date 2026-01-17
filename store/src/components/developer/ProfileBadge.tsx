import { Link } from "react-router";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useDeveloperProfile } from "@/hooks/useDeveloperProfile";

export function ProfileBadge() {
  const { loading, isAuthenticated, hasProfile, profile, user } = useDeveloperProfile();

  if (loading) {
    return <Spinner className="size-4" />;
  }

  if (!isAuthenticated) {
    return (
      <span className="text-sm text-muted-foreground">Not signed in</span>
    );
  }

  if (!hasProfile) {
    return (
      <Button asChild variant="ghost" size="sm">
        <Link to="/profile/setup">
          <User className="size-4" data-icon="inline-start" />
          Set up profile
        </Link>
      </Button>
    );
  }

  return (
    <Button asChild variant="ghost" size="sm">
      <Link to="/profile/edit">
        <User className="size-4" data-icon="inline-start" />
        {profile?.display_name || user?.displayName}
      </Link>
    </Button>
  );
}
