import { useState } from "react";
import { Link } from "react-router";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { os } from "@/lib/os";
import type { StoreApp } from "@/lib/supabase/client";

type AppCardProps = {
  app: StoreApp;
};

export function AppCard({ app }: AppCardProps) {
  const [installing, setInstalling] = useState(false);

  const handleInstall = async () => {
    setInstalling(true);
    try {
      await os.apps.requestAppInstall({
        bundleId: app.bundle_id,
        name: app.name,
        author: app.author,
        url: app.url,
      });
    } catch (error) {
      console.error("Failed to request app install:", error);
    } finally {
      setInstalling(false);
    }
  };

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>{app.name}</CardTitle>
        <CardDescription>
          by{" "}
          {app.developer_id ? (
            <Link
              to={`/developer/${app.developer_id}`}
              className="hover:underline"
            >
              {app.author}
            </Link>
          ) : (
            app.author
          )}
        </CardDescription>
      </CardHeader>
      {app.description && (
        <div className="px-4 -mt-2">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {app.description}
          </p>
        </div>
      )}
      <CardFooter className="mt-auto">
        <Button
          size="sm"
          onClick={handleInstall}
          disabled={installing}
          className="w-full"
        >
          {installing ? <Spinner className="size-4" /> : "Install"}
        </Button>
      </CardFooter>
    </Card>
  );
}
