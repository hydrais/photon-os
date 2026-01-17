import { useNavigate, Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { ProfileForm } from "@/components/developer/ProfileForm";
import { useDeveloperProfile } from "@/hooks/useDeveloperProfile";
import { useCreateProfile } from "@/hooks/useCreateProfile";

export function ProfileSetupScreen() {
  const navigate = useNavigate();
  const { user, loading: profileLoading, isAuthenticated } = useDeveloperProfile();
  const { create, loading, error } = useCreateProfile();

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <h2 className="text-xl font-semibold mb-2">Sign in to Photon OS</h2>
          <p className="text-muted-foreground">
            You need to be signed in to Photon OS to set up a developer profile.
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (data: { displayName: string; description: string }) => {
    const profile = await create({
      userId: user.id,
      displayName: data.displayName,
      description: data.description || undefined,
    });

    if (profile) {
      navigate("/submit");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-lg mx-auto px-4 py-6">
        <header className="mb-6">
          <Button asChild variant="ghost" size="sm" className="-ml-2 mb-4">
            <Link to="/">
              <ArrowLeft className="size-4" data-icon="inline-start" />
              Back
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold">Set Up Developer Profile</h1>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Create Your Profile</CardTitle>
            <CardDescription>
              Set up your developer profile to list apps in the store. This
              information will be shown to users who view your apps.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm
              initialData={{ displayName: user.displayName, description: "" }}
              onSubmit={handleSubmit}
              loading={loading}
              error={error}
              submitLabel="Create Profile"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
