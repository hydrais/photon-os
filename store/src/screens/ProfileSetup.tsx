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
  const {
    user,
    loading: profileLoading,
    isAuthenticated,
    hasProfile,
    refetch,
    setActiveProfile,
  } = useDeveloperProfile();
  const { create, loading, error } = useCreateProfile();

  const title = hasProfile
    ? "Add Developer Profile"
    : "Set Up Developer Profile";

  if (profileLoading) {
    return (
      <>
        <PhotonNavBar>
          <PhotonNavBarBackButton onClick={() => navigate("/more")} />
          <PhotonNavBarTitle>{title}</PhotonNavBarTitle>
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
          <PhotonNavBarTitle>{title}</PhotonNavBarTitle>
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
    // Captured before create() so navigation reflects whether this was the
    // user's first profile or an additional one.
    const isFirstProfile = !hasProfile;

    const profile = await create({
      userId: user.id,
      displayName: data.displayName,
      description: data.description || undefined,
    });

    if (profile) {
      // Make the newly created profile active. It must be present in the
      // provider's profiles list first, so refetch before switching.
      await refetch();
      setActiveProfile(profile.id);

      // First-time onboarding flows straight into listing an app; adding an
      // additional profile returns to the (now newly-scoped) dashboard.
      navigate(isFirstProfile ? "/more/store/submit" : "/more/store/dashboard");
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
            <CardTitle>
              {hasProfile ? "Create Another Profile" : "Create Your Profile"}
            </CardTitle>
            <CardDescription>
              {hasProfile
                ? "Add another developer profile so you can list apps under a different developer name."
                : "Set up your developer profile to list apps in the store. This information will be shown to users who view your apps."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm
              initialData={{
                displayName: hasProfile ? "" : user.displayName,
                description: "",
              }}
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
