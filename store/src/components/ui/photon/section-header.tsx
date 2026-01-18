import type { PropsWithChildren } from "react";

export function PhotonSectionHeader({ children }: PropsWithChildren) {
  return (
    <h2 className="text-sm font-medium text-muted-foreground mb-2">
      {children}
    </h2>
  );
}
