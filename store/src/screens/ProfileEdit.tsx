import { useNavigate, Link } from "react-router";
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
import { PhotonNavBar } from "@/components/ui/photon/nav-bar";
import { PhotonNavBarBackButton } from "@/components/ui/photon/nav-bar-back-button";
import { PhotonNavBarTitle } from "@/components/ui/photon/nav-bar-title";
import { PhotonContentArea } from "@/components/ui/photon/content-area";

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
      <>
        <PhotonNavBar>
          <PhotonNavBarBackButton onClick={() => navigate("/more")} />
          <PhotonNavBarTitle>Edit Profile</PhotonNavBarTitle>
        </PhotonNavBar>
        <PhotonContentArea>
          <div className="flex items-center justify-center py-12">
            <Spinner className="size-8" />
          </div>
        </PhotonContentArea>
      </>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <PhotonNavBar>
          <PhotonNavBarBackButton onClick={() => navigate("/more")} />
          <PhotonNavBarTitle>Edit Profile</PhotonNavBarTitle>
        </PhotonNavBar>
        <PhotonContentArea>
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Sign in to Photon OS</h2>
            <p className="text-muted-foreground">
              You need to be signed in to Photon OS to edit your profile.
            </p>
          </div>
        </PhotonContentArea>
      </>
    );
  }

  if (!hasProfile || !profile) {
    return (
      <>
        <PhotonNavBar>
          <PhotonNavBarBackButton onClick={() => navigate("/more")} />
          <PhotonNavBarTitle>Edit Profile</PhotonNavBarTitle>
        </PhotonNavBar>
        <PhotonContentArea>
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">No Profile Found</h2>
            <p className="text-muted-foreground mb-4">
              You haven't set up a developer profile yet.
            </p>
            <Button asChild>
              <Link to="/profile/setup">Set Up Profile</Link>
            </Button>
          </div>
        </PhotonContentArea>
      </>
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
      navigate("/more");
    }
  };

  return (
    <>
      <PhotonNavBar>
        <PhotonNavBarBackButton onClick={() => navigate("/more")} />
        <PhotonNavBarTitle>Edit Profile</PhotonNavBarTitle>
      </PhotonNavBar>

      <PhotonContentArea>
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
      </PhotonContentArea>
    </>
  );
}
