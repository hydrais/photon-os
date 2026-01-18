import type { PropsWithChildren } from "react";

export function PhotonContentArea({ children }: PropsWithChildren) {
  return (
    <main className="flex-1 container max-w-4xl mx-auto p-2 flex flex-col gap-2 overflow-y-auto">
      {children}
    </main>
  );
}
