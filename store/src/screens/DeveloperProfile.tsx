import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
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
import { AppCard } from "@/components/store/AppCard";
import { supabase, type DeveloperProfile, type StoreApp } from "@/lib/supabase/client";

export function DeveloperProfileScreen() {
  const { developerId } = useParams<{ developerId: string }>();
  const [profile, setProfile] = useState<DeveloperProfile | null>(null);
  const [apps, setApps] = useState<StoreApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!developerId) return;

      setLoading(true);
      setError(null);

      // Fetch developer profile
      const { data: profileData, error: profileError } = await supabase
        .from("developer_profiles")
        .select("*")
        .eq("id", developerId)
        .single();

      if (profileError) {
        setError("Developer not found");
        setLoading(false);
        return;
      }

      setProfile(profileData);

      // Fetch developer's listed apps only
      const { data: appsData, error: appsError } = await supabase
        .from("store_apps")
        .select("*")
        .eq("developer_id", developerId)
        .eq("status", "listed")
        .order("submitted_at", { ascending: false });

      if (appsError) {
        console.error("Failed to fetch apps:", appsError);
      } else {
        // Map apps to include developer info
        setApps(
          (appsData || []).map((app) => ({
            ...app,
            author: profileData.display_name,
            developer_display_name: profileData.display_name,
            developer_description: profileData.description,
          }))
        );
      }

      setLoading(false);
    }

    fetchData();
  }, [developerId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-4xl mx-auto px-4 py-6">
          <Button asChild variant="ghost" size="sm" className="-ml-2 mb-4">
            <Link to="/">
              <ArrowLeft className="size-4" data-icon="inline-start" />
              Back
            </Link>
          </Button>
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Developer Not Found</h2>
            <p className="text-muted-foreground">
              The developer profile you're looking for doesn't exist.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-6">
        <header className="mb-6">
          <Button asChild variant="ghost" size="sm" className="-ml-2 mb-4">
            <Link to="/">
              <ArrowLeft className="size-4" data-icon="inline-start" />
              Back
            </Link>
          </Button>
        </header>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{profile.display_name}</CardTitle>
            {profile.description && (
              <CardDescription className="whitespace-pre-wrap">
                {profile.description}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {apps.length} {apps.length === 1 ? "app" : "apps"} published
            </p>
          </CardContent>
        </Card>

        {apps.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {apps.map((app) => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              This developer hasn't published any apps yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
