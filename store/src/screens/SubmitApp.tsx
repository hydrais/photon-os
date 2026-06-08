import { useNavigate } from "react-router";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { SubmitAppForm } from "@/components/store/SubmitAppForm";
import { useDeveloperProfile } from "@/hooks/useDeveloperProfile";
import { PhotonNavBar } from "@/components/ui/photon/nav-bar";
import { PhotonNavBarBackButton } from "@/components/ui/photon/nav-bar-back-button";
import { PhotonNavBarTitle } from "@/components/ui/photon/nav-bar-title";
import { PhotonContentArea } from "@/components/ui/photon/content-area";

function SubmitAppContent() {
  const navigate = useNavigate();
  const { profile } = useDeveloperProfile();

  const handleSuccess = () => {
    navigate("/more/store/dashboard");
  };

  if (!profile) {
    return null;
  }

  return (
    <>
      <PhotonNavBar>
        <PhotonNavBarBackButton onClick={() => navigate("/more/store/dashboard")} />
        <PhotonNavBarTitle>List Your App</PhotonNavBarTitle>
      </PhotonNavBar>

      <PhotonContentArea>
        <Card>
          <CardHeader>
            <CardTitle>App Details</CardTitle>
            <CardDescription>
              Fill out the form below to list your app in the store.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SubmitAppForm
              developerId={profile.id}
              developerDisplayName={profile.display_name}
              onSuccess={handleSuccess}
            />
          </CardContent>
        </Card>
      </PhotonContentArea>
    </>
  );
}

export function SubmitAppScreen() {
  return (
    <AuthGuard requireProfile>
      <SubmitAppContent />
    </AuthGuard>
  );
}
