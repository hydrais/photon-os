import type { PropsWithChildren } from "react";

export function PhotonNavBarTitle({ children }: PropsWithChildren) {
  return (
    <h1 className="text-base font-semibold flex-1 first:pl-4">{children}</h1>
  );
}
