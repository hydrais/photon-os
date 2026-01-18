import { useState } from "react";
import { Link } from "react-router";
import { Pencil, EyeOff, Eye, Trash2 } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { UnlistAppDialog } from "./UnlistAppDialog";
import { DeleteAppDialog } from "./DeleteAppDialog";
import { useUnlistApp } from "@/hooks/useUnlistApp";
import { useRelistApp } from "@/hooks/useRelistApp";
import { useDeleteApp } from "@/hooks/useDeleteApp";
import type { StoreApp } from "@/lib/supabase/client";

type DeveloperAppCardProps = {
  app: StoreApp;
  onUpdate: () => void;
};

export function DeveloperAppCard({ app, onUpdate }: DeveloperAppCardProps) {
  const [showUnlistDialog, setShowUnlistDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { unlist, loading: unlisting } = useUnlistApp();
  const { relist, loading: relisting } = useRelistApp();
  const { deleteApp, loading: deleting } = useDeleteApp();

  const isUnlisted = app.status === "unlisted";

  const handleUnlist = async () => {
    const success = await unlist(app.id);
    if (success) {
      setShowUnlistDialog(false);
      onUpdate();
    }
  };

  const handleRelist = async () => {
    const success = await relist(app.id);
    if (success) {
      onUpdate();
    }
  };

  const handleDelete = async () => {
    const success = await deleteApp(app.id);
    if (success) {
      setShowDeleteDialog(false);
      onUpdate();
    }
  };

  return (
    <>
      <Card size="sm" className={isUnlisted ? "opacity-75" : undefined}>
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <CardTitle className="truncate">{app.name}</CardTitle>
              <CardDescription className="truncate">
                {app.bundle_id}
              </CardDescription>
            </div>
            <Badge variant={isUnlisted ? "secondary" : "default"}>
              {isUnlisted ? "Unlisted" : "Listed"}
            </Badge>
          </div>
        </CardHeader>
        {app.description && (
          <div className="px-4 -mt-2">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {app.description}
            </p>
          </div>
        )}
        <CardFooter className="mt-auto gap-2 flex-wrap">
          <Button asChild size="sm" variant="outline" className="flex-1">
            <Link to={`/more/store/app/${app.id}`}>
              <Pencil className="size-4" data-icon="inline-start" />
              Edit
            </Link>
          </Button>
          {isUnlisted ? (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={handleRelist}
                disabled={relisting}
                className="flex-1"
              >
                {relisting ? (
                  <Spinner className="size-4" />
                ) : (
                  <>
                    <Eye className="size-4" data-icon="inline-start" />
                    Relist
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                className="flex-1"
              >
                <Trash2 className="size-4" data-icon="inline-start" />
                Delete
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowUnlistDialog(true)}
              className="flex-1"
            >
              <EyeOff className="size-4" data-icon="inline-start" />
              Unlist
            </Button>
          )}
        </CardFooter>
      </Card>

      <UnlistAppDialog
        open={showUnlistDialog}
        onOpenChange={setShowUnlistDialog}
        appName={app.name}
        loading={unlisting}
        onConfirm={handleUnlist}
      />

      <DeleteAppDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        appName={app.name}
        loading={deleting}
        onConfirm={handleDelete}
      />
    </>
  );
}
