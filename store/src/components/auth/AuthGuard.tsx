import type { ReactNode } from "react";
import { Navigate } from "react-router";
import { Spinner } from "@/components/ui/spinner";
import { useDeveloperProfile } from "@/hooks/useDeveloperProfile";

type AuthGuardProps = {
  children: ReactNode;
  requireProfile?: boolean;
};

export function AuthGuard({ children, requireProfile = false }: AuthGuardProps) {
  const { loading, isAuthenticated, hasProfile, error } = useDeveloperProfile();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <h2 className="text-xl font-semibold mb-2">Sign in to Photon OS</h2>
          <p className="text-muted-foreground">
            {error || "You need to be signed in to Photon OS to access this page."}
          </p>
        </div>
      </div>
    );
  }

  if (requireProfile && !hasProfile) {
    return <Navigate to="/profile/setup" replace />;
  }

  return <>{children}</>;
}
