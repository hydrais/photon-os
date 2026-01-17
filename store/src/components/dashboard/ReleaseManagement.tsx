import { useState } from "react";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAppReleases } from "@/hooks/useAppReleases";
import { usePublishRelease } from "@/hooks/usePublishRelease";
import { useEditRelease } from "@/hooks/useEditRelease";
import { useDeleteRelease } from "@/hooks/useDeleteRelease";
import { supabase } from "@/lib/supabase/client";
import type { AppRelease } from "@/lib/supabase/client";

type ReleaseManagementProps = {
  appId: string;
  currentVersion: string | null;
  onVersionChange?: (version: string) => void;
};

type EditingRelease = {
  id: string;
  version: string;
  releaseNotes: string;
};

export function ReleaseManagement({
  appId,
  currentVersion,
  onVersionChange,
}: ReleaseManagementProps) {
  const { releases, loading, refetch } = useAppReleases(appId);
  const {
    publish,
    loading: publishing,
    error: publishError,
  } = usePublishRelease();
  const { edit, loading: editing, error: editError } = useEditRelease();
  const {
    deleteRelease,
    loading: deleting,
    error: deleteError,
  } = useDeleteRelease();

  const [showNewForm, setShowNewForm] = useState(false);
  const [newVersion, setNewVersion] = useState("");
  const [newReleaseNotes, setNewReleaseNotes] = useState("");

  const [editingRelease, setEditingRelease] = useState<EditingRelease | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<AppRelease | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const handlePublish = async () => {
    if (!newVersion.trim()) return;

    const success = await publish(appId, {
      version: newVersion.trim(),
      releaseNotes: newReleaseNotes.trim() || null,
    });

    if (success) {
      setNewVersion("");
      setNewReleaseNotes("");
      setShowNewForm(false);
      refetch();
      onVersionChange?.(newVersion.trim());
    }
  };

  const handleStartEdit = (release: AppRelease) => {
    setEditingRelease({
      id: release.id,
      version: release.version,
      releaseNotes: release.release_notes || "",
    });
  };

  const handleCancelEdit = () => {
    setEditingRelease(null);
  };

  const handleSaveEdit = async () => {
    if (!editingRelease || !editingRelease.version.trim()) return;

    const success = await edit(editingRelease.id, {
      version: editingRelease.version.trim(),
      releaseNotes: editingRelease.releaseNotes.trim() || null,
    });

    if (success) {
      // If we edited the latest release, update current_version on the app
      const latestRelease = releases[0];
      if (latestRelease && latestRelease.id === editingRelease.id) {
        await supabase
          .from("store_apps")
          .update({ current_version: editingRelease.version.trim() })
          .eq("id", appId);
        onVersionChange?.(editingRelease.version.trim());
      }
      setEditingRelease(null);
      refetch();
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    console.log("Deleting release:", deleteTarget.id);
    const success = await deleteRelease(deleteTarget.id);
    console.log("Delete result:", success);

    if (success) {
      // If we deleted the latest release, update current_version to the next one
      const latestRelease = releases[0];
      if (latestRelease && latestRelease.id === deleteTarget.id) {
        const nextRelease = releases[1];
        const newCurrentVersion = nextRelease?.version || null;
        await supabase
          .from("store_apps")
          .update({ current_version: newCurrentVersion })
          .eq("id", appId);
        onVersionChange?.(newCurrentVersion || "");
      }
      setDeleteTarget(null);
      refetch();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner className="size-6" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with current version and add button */}
      <div className="flex items-center justify-between">
        <div>
          {currentVersion ? (
            <p className="text-sm text-muted-foreground">
              Current version:{" "}
              <span className="font-medium text-foreground">
                {currentVersion}
              </span>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">No releases yet</p>
          )}
        </div>
        {!showNewForm && (
          <Button size="sm" onClick={() => setShowNewForm(true)}>
            <Plus className="size-4" data-icon="inline-start" />
            New Release
          </Button>
        )}
      </div>

      {/* New Release Form */}
      {showNewForm && (
        <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">New Release</h4>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => {
                setShowNewForm(false);
                setNewVersion("");
                setNewReleaseNotes("");
              }}
            >
              <X className="size-4" />
            </Button>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Version</label>
            <Input
              placeholder="1.0.0"
              value={newVersion}
              onChange={(e) => setNewVersion(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Release Notes (optional)
            </label>
            <Textarea
              placeholder="What's new in this version..."
              value={newReleaseNotes}
              onChange={(e) => setNewReleaseNotes(e.target.value)}
              rows={3}
            />
          </div>
          {publishError && (
            <p className="text-sm text-destructive">{publishError}</p>
          )}
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowNewForm(false);
                setNewVersion("");
                setNewReleaseNotes("");
              }}
              disabled={publishing}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handlePublish}
              disabled={publishing || !newVersion.trim()}
            >
              {publishing ? <Spinner className="size-4" /> : "Publish"}
            </Button>
          </div>
        </div>
      )}

      {/* Release List */}
      {releases.length === 0 && !showNewForm ? (
        <div className="text-center py-8 border rounded-lg bg-muted/30">
          <p className="text-muted-foreground mb-2">
            No releases published yet
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowNewForm(true)}
          >
            <Plus className="size-4" data-icon="inline-start" />
            Publish your first release
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {releases.map((release, index) => (
            <div key={release.id} className="border rounded-lg p-4 space-y-2">
              {editingRelease?.id === release.id ? (
                // Edit mode
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Version</label>
                    <Input
                      value={editingRelease.version}
                      onChange={(e) =>
                        setEditingRelease({
                          ...editingRelease,
                          version: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Release Notes</label>
                    <Textarea
                      value={editingRelease.releaseNotes}
                      onChange={(e) =>
                        setEditingRelease({
                          ...editingRelease,
                          releaseNotes: e.target.value,
                        })
                      }
                      rows={3}
                    />
                  </div>
                  {editError && (
                    <p className="text-sm text-destructive">{editError}</p>
                  )}
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelEdit}
                      disabled={editing}
                    >
                      <X className="size-4" data-icon="inline-start" />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveEdit}
                      disabled={editing || !editingRelease.version.trim()}
                    >
                      {editing ? (
                        <Spinner className="size-4" />
                      ) : (
                        <>
                          <Check className="size-4" data-icon="inline-start" />
                          Save
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                // View mode
                <>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">v{release.version}</span>
                      {index === 0 && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          Latest
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleStartEdit(release)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setDeleteTarget(release)}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(release.published_at)}
                  </p>
                  {release.release_notes ? (
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {release.release_notes}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      No release notes
                    </p>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && !deleting && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Release</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete version {deleteTarget?.version}?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && (
            <p className="text-sm text-destructive px-6">{deleteError}</p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleting}
            >
              {deleting ? <Spinner className="size-4" /> : "Delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
