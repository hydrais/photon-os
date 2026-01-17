import type { PropsWithChildren } from "react";
import { useLongPress } from "@/hooks/useLongPress";

export function NavigationBarButton({
  children,
  onClick,
  onLongPress,
}: PropsWithChildren<{ onClick: () => void; onLongPress?: () => void }>) {
  const longPressHandlers = useLongPress(
    () => {
      onLongPress?.();
    },
    { delay: 500 }
  );

  const handleClick = () => {
    // Don't trigger click if a long press just occurred
    if (longPressHandlers.wasLongPressRef.current) {
      longPressHandlers.wasLongPressRef.current = false;
      return;
    }
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      className="rounded-full focus:ring-0 focus:outline-none focus:bg-background/20 hover:bg-background/20 active:bg-background/30 transition-all p-1.5 flex items-center justify-center active:scale-90 border-3 border-transparent active:border-background/50"
      {...(onLongPress
        ? {
            onPointerDown: longPressHandlers.onPointerDown,
            onPointerMove: longPressHandlers.onPointerMove,
            onPointerUp: longPressHandlers.onPointerUp,
            onPointerCancel: longPressHandlers.onPointerCancel,
            onPointerLeave: longPressHandlers.onPointerLeave,
          }
        : {})}
    >
      {children}
    </button>
  );
}
