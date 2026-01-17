import type { AppRelease } from "@/lib/supabase/client";

type ReleaseNotePreviewProps = {
  release: AppRelease;
  maxLength?: number;
};

export function ReleaseNotePreview({
  release,
  maxLength = 80,
}: ReleaseNotePreviewProps) {
  const truncatedNotes =
    release.release_notes && release.release_notes.length > maxLength
      ? release.release_notes.substring(0, maxLength) + "..."
      : release.release_notes;

  return (
    <div className="text-sm text-muted-foreground">
      <span className="font-medium text-foreground">v{release.version}</span>
      {truncatedNotes && (
        <span className="ml-2">&mdash; {truncatedNotes}</span>
      )}
    </div>
  );
}
