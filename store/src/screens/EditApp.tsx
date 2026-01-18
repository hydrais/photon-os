import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { EditAppForm } from "@/components/dashboard/EditAppForm";
import { ReleaseManagement } from "@/components/dashboard/ReleaseManagement";
import { ReviewManagement } from "@/components/dashboard/ReviewManagement";
import { useDeveloperProfile } from "@/hooks/useDeveloperProfile";
import { supabase, type StoreApp } from "@/lib/supabase/client";
import { PhotonNavBar } from "@/components/ui/photon/nav-bar";
import { PhotonNavBarBackButton } from "@/components/ui/photon/nav-bar-back-button";
import { PhotonNavBarTitle } from "@/components/ui/photon/nav-bar-title";
import { PhotonContentArea } from "@/components/ui/photon/content-area";

function EditAppContent() {
  const { appId } = useParams<{ appId: string }>();
  const navigate = useNavigate();
  const { profile } = useDeveloperProfile();
  const [app, setApp] = useState<StoreApp | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchApp() {
      if (!appId || !profile) return;

      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("store_apps")
        .select("*")
        .eq("id", appId)
        .eq("developer_id", profile.id)
        .single();

      if (fetchError) {
        if (fetchError.code === "PGRST116") {
          setError("App not found or you don't have permission to edit it.");
        } else {
          setError(fetchError.message);
        }
        setApp(null);
      } else {
        setApp(data);
      }

      setLoading(false);
    }

    fetchApp();
  }, [appId, profile]);

  const handleSuccess = () => {
    navigate("/more/store/dashboard");
  };

  const handleCancel = () => {
    navigate("/more/store/dashboard");
  };

  if (loading) {
    return (
      <>
        <PhotonNavBar>
          <PhotonNavBarBackButton onClick={() => navigate("/more/store/dashboard")} />
          <PhotonNavBarTitle>Edit App</PhotonNavBarTitle>
        </PhotonNavBar>
        <PhotonContentArea>
          <div className="flex items-center justify-center py-12">
            <Spinner className="size-8" />
          </div>
        </PhotonContentArea>
      </>
    );
  }

  if (error || !app) {
    return (
      <>
        <PhotonNavBar>
          <PhotonNavBarBackButton onClick={() => navigate("/more/store/dashboard")} />
          <PhotonNavBarTitle>Edit App</PhotonNavBarTitle>
        </PhotonNavBar>
        <PhotonContentArea>
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">App Not Found</h2>
            <p className="text-muted-foreground">
              {error || "The app you're looking for doesn't exist or you don't have permission to edit it."}
            </p>
          </div>
        </PhotonContentArea>
      </>
    );
  }

  const handleVersionChange = (newVersion: string) => {
    setApp((prev) => (prev ? { ...prev, current_version: newVersion } : null));
  };

  const handleStatsChange = async () => {
    if (!appId) return;
    const { data } = await supabase
      .from("store_apps")
      .select("average_rating, review_count")
      .eq("id", appId)
      .single();
    if (data) {
      setApp((prev) =>
        prev
          ? {
              ...prev,
              average_rating: data.average_rating,
              review_count: data.review_count,
            }
          : null
      );
    }
  };

  return (
    <>
      <PhotonNavBar>
        <PhotonNavBarBackButton onClick={() => navigate("/more/store/dashboard")} />
        <PhotonNavBarTitle>Edit App</PhotonNavBarTitle>
      </PhotonNavBar>

      <PhotonContentArea>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>App Details</CardTitle>
              <CardDescription>
                Update your app's information below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EditAppForm
                app={app}
                onSuccess={handleSuccess}
                onCancel={handleCancel}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Releases</CardTitle>
              <CardDescription>
                Manage your app's release history and publish new versions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReleaseManagement
                appId={app.id}
                currentVersion={app.current_version}
                onVersionChange={handleVersionChange}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reviews</CardTitle>
              <CardDescription>
                View and manage reviews from users.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReviewManagement
                app={app}
                onStatsChange={handleStatsChange}
              />
            </CardContent>
          </Card>
        </div>
      </PhotonContentArea>
    </>
  );
}

export function EditAppScreen() {
  return (
    <AuthGuard requireProfile>
      <EditAppContent />
    </AuthGuard>
  );
}
