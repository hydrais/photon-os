import { useRef, useCallback } from "react";

interface LongPressOptions {
  delay?: number;
  moveThreshold?: number;
}

interface LongPressHandlers {
  onPointerDown: (event: React.PointerEvent) => void;
  onPointerMove: (event: React.PointerEvent) => void;
  onPointerUp: (event: React.PointerEvent) => void;
  onPointerCancel: (event: React.PointerEvent) => void;
  onPointerLeave: (event: React.PointerEvent) => void;
}

export function useLongPress(
  onLongPress: (event: React.PointerEvent) => void,
  options: LongPressOptions = {}
): LongPressHandlers {
  const { delay = 500, moveThreshold = 10 } = options;

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const eventRef = useRef<React.PointerEvent | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    startPosRef.current = null;
    eventRef.current = null;
  }, []);

  const onPointerDown = useCallback(
    (event: React.PointerEvent) => {
      // Only handle mouse events - touch/pen already handled by Radix
      if (event.pointerType !== "mouse") {
        return;
      }

      // Don't trigger on right-click (native context menu)
      if (event.button !== 0) {
        return;
      }

      startPosRef.current = { x: event.clientX, y: event.clientY };
      eventRef.current = event;

      timerRef.current = setTimeout(() => {
        if (eventRef.current) {
          onLongPress(eventRef.current);
        }
        clearTimer();
      }, delay);
    },
    [delay, onLongPress, clearTimer]
  );

  const onPointerMove = useCallback(
    (event: React.PointerEvent) => {
      if (!startPosRef.current || !timerRef.current) {
        return;
      }

      const dx = Math.abs(event.clientX - startPosRef.current.x);
      const dy = Math.abs(event.clientY - startPosRef.current.y);

      if (dx > moveThreshold || dy > moveThreshold) {
        clearTimer();
      } else {
        // Update event ref to latest position
        eventRef.current = event;
      }
    },
    [moveThreshold, clearTimer]
  );

  const onPointerUp = useCallback(() => {
    clearTimer();
  }, [clearTimer]);

  const onPointerCancel = useCallback(() => {
    clearTimer();
  }, [clearTimer]);

  const onPointerLeave = useCallback(() => {
    clearTimer();
  }, [clearTimer]);

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    onPointerLeave,
  };
}
