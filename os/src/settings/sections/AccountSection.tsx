import { useAuth } from "@/lib/auth/AuthContext";
import { Button } from "@/components/ui/button";

export function AccountSection() {
  const { user, signOut } = useAuth();

  const displayName =
    user?.user_metadata?.display_name ||
    user?.email?.split("@")[0] ||
    "User";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">Profile</h2>
        <p className="text-sm text-muted-foreground">Your account information</p>
      </div>

      <div className="rounded-2xl bg-card ring-1 ring-foreground/10 p-4">
        <p className="text-sm text-muted-foreground">Signed in as</p>
        <p className="font-medium text-lg">{displayName}</p>
        <p className="text-sm text-muted-foreground">{user?.email}</p>
      </div>

      <Button onClick={signOut} variant="destructive" className="w-fit">
        Sign Out
      </Button>
    </div>
  );
}
