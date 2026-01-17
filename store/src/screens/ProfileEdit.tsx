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
import { useUpdateProfile } from "@/hooks/useUpdateProfile";

export function ProfileEditScreen() {
  const navigate = useNavigate();
  const {
    profile,
    loading: profileLoading,
    isAuthenticated,
    hasProfile,
  } = useDeveloperProfile();
  const { update, loading, error } = useUpdateProfile();

  if (profileLoading) {
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
            You need to be signed in to Photon OS to edit your profile.
          </p>
        </div>
      </div>
    );
  }

  if (!hasProfile || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <h2 className="text-xl font-semibold mb-2">No Profile Found</h2>
          <p className="text-muted-foreground mb-4">
            You haven't set up a developer profile yet.
          </p>
          <Button asChild>
            <Link to="/profile/setup">Set Up Profile</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (data: {
    displayName: string;
    description: string;
  }) => {
    const updatedProfile = await update(profile.id, {
      displayName: data.displayName,
      description: data.description || undefined,
    });

    if (updatedProfile) {
      navigate("/");
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
          <h1 className="text-2xl font-semibold">Edit Profile</h1>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Developer Profile</CardTitle>
            <CardDescription>
              Update your developer profile information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm
              initialData={{
                displayName: profile.display_name,
                description: profile.description || "",
              }}
              onSubmit={handleSubmit}
              loading={loading}
              error={error}
              submitLabel="Save Changes"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
