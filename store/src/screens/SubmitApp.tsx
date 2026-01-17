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
import { AuthGuard } from "@/components/auth/AuthGuard";
import { SubmitAppForm } from "@/components/store/SubmitAppForm";
import { useDeveloperProfile } from "@/hooks/useDeveloperProfile";

function SubmitAppContent() {
  const navigate = useNavigate();
  const { profile } = useDeveloperProfile();

  const handleSuccess = () => {
    navigate("/dashboard");
  };

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-lg mx-auto px-4 py-6">
        <header className="mb-6">
          <Button asChild variant="ghost" size="sm" className="-ml-2 mb-4">
            <Link to="/more">
              <ArrowLeft className="size-4" data-icon="inline-start" />
              Back
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold">List Your App</h1>
        </header>

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
      </div>
    </div>
  );
}

export function SubmitAppScreen() {
  return (
    <AuthGuard requireProfile>
      <SubmitAppContent />
    </AuthGuard>
  );
}
