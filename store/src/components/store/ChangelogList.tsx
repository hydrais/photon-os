import type { AppRelease } from "@/lib/supabase/client";

type ChangelogListProps = {
  releases: AppRelease[];
};

export function ChangelogList({ releases }: ChangelogListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (releases.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No release history yet.</p>
    );
  }

  return (
    <div className="space-y-4">
      {releases.map((release) => (
        <div key={release.id} className="border-b pb-4 last:border-b-0">
          <div className="flex items-baseline justify-between gap-2 text-sm">
            <span className="font-medium">v{release.version}</span>
            <span className="text-sm text-muted-foreground">
              {formatDate(release.published_at)}
            </span>
          </div>
          {release.release_notes ? (
            <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">
              {release.release_notes}
            </p>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground italic">
              No release notes
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
