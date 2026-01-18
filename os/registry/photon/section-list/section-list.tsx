import type { PropsWithChildren } from "react";

export function PhotonSectionList({ children }: PropsWithChildren) {
  return <div className="divide-y divide-border">{children}</div>;
}
