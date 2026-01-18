import type { PropsWithChildren } from "react";

export function PhotonTabBar({ children }: PropsWithChildren) {
  return (
    <footer className="border-t p-2 flex flex-row gap-2 justify-around">
      {children}
    </footer>
  );
}
