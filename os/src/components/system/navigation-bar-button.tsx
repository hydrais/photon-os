import type { PropsWithChildren } from "react";

export function NavigationBarButton({
  children,
  onClick,
}: PropsWithChildren<{ onClick: () => void }>) {
  return (
    <button
      onClick={onClick}
      className="rounded-full focus:ring-0 focus:outline-none focus:bg-background/20 hover:bg-background/20 active:bg-background/30 transition-all p-1.5 flex items-center justify-center active:scale-90 border-3 border-transparent active:border-background/50"
    >
      {children}
    </button>
  );
}
