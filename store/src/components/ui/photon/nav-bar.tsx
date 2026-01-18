import type { PropsWithChildren } from "react";

export function PhotonNavBar({ children }: PropsWithChildren) {
  return (
    <header className="p-2 border-b flex flex-row items-center gap-3 h-14">
      {children}
    </header>
  );
}
