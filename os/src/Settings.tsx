import { useAuth } from "./lib/auth/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function Settings() {
  const { user, signOut } = useAuth();

  const displayName =
    user?.user_metadata?.display_name ||
    user?.email?.split("@")[0] ||
    "User";

  return (
    <div className="h-full bg-background p-4">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Manage your account settings</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Signed in as</p>
            <p className="font-medium">{displayName}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
          <Button onClick={signOut} variant="destructive" className="w-fit">
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
