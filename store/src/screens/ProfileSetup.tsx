import { useNavigate } from "react-router";
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
import { PhotonNavBar } from "@/components/ui/photon/nav-bar";
import { PhotonNavBarBackButton } from "@/components/ui/photon/nav-bar-back-button";
import { PhotonNavBarTitle } from "@/components/ui/photon/nav-bar-title";
import { PhotonContentArea } from "@/components/ui/photon/content-area";

export function ProfileSetupScreen() {
  const navigate = useNavigate();
  const { user, loading: profileLoading, isAuthenticated } = useDeveloperProfile();
  const { create, loading, error } = useCreateProfile();

  if (profileLoading) {
    return (
      <>
        <PhotonNavBar>
          <PhotonNavBarBackButton onClick={() => navigate("/more")} />
          <PhotonNavBarTitle>Set Up Developer Profile</PhotonNavBarTitle>
        </PhotonNavBar>
        <PhotonContentArea>
          <div className="flex items-center justify-center py-12">
            <Spinner className="size-8" />
          </div>
        </PhotonContentArea>
      </>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <>
        <PhotonNavBar>
          <PhotonNavBarBackButton onClick={() => navigate("/more")} />
          <PhotonNavBarTitle>Set Up Developer Profile</PhotonNavBarTitle>
        </PhotonNavBar>
        <PhotonContentArea>
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Sign in to Photon OS</h2>
            <p className="text-muted-foreground">
              You need to be signed in to Photon OS to set up a developer profile.
            </p>
          </div>
        </PhotonContentArea>
      </>
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
    <>
      <PhotonNavBar>
        <PhotonNavBarBackButton onClick={() => navigate("/more")} />
        <PhotonNavBarTitle>Set Up Developer Profile</PhotonNavBarTitle>
      </PhotonNavBar>

      <PhotonContentArea>
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
      </PhotonContentArea>
    </>
  );
}
