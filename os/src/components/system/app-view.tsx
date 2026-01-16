import { OperatingSystemContext } from "@/lib/os/OperatingSystemContext";
import { cn } from "@/lib/utils";
import {
  useCallback,
  useContext,
  useRef,
  useState,
  useLayoutEffect,
  useEffect,
  useMemo,
} from "react";
import type { RunningAppInstance } from "@photon-os/sdk";
import { LAUNCHER_APP } from "@/lib/os/OperatingSystemContext";
import { X } from "lucide-react";

function AppIframe({
  app,
  setAppIframeRef,
}: {
  app: RunningAppInstance;
  setAppIframeRef: (
    bundleId: string,
    element: HTMLIFrameElement | null
  ) => void;
}) {
  const refCallback = useCallback(
    (e: HTMLIFrameElement | null) => {
      setAppIframeRef(app.definition.bundleId, e);
    },
    [app.definition.bundleId, setAppIframeRef]
  );

  return (
    <iframe
      className="h-full w-full border-0"
      src={app.definition.url}
      ref={refCallback}
    />
  );
}

// Card dimensions
const CARD_WIDTH = 192;
const CARD_HEIGHT = 288;
const CARD_SCALE = 0.4;
const CARD_GAP = 16;
const CARD_PADDING = 32;
const HEADER_HEIGHT = 32;

export function AppView({
  showMultitasking = false,
}: {
  showMultitasking?: boolean;
}) {
  const { runningApps, setAppIframeRef, foregroundApp, closeApp, setMultitasking } = useContext(
    OperatingSystemContext
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftStart, setScrollLeftStart] = useState(0);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const launcherApp = runningApps.find(
    (app) => app.definition.bundleId === LAUNCHER_APP.bundleId
  );

  // Non-launcher apps in stable order (for iframe rendering)
  const nonLauncherApps = useMemo(() => {
    return runningApps.filter(
      (app) => app.definition.bundleId !== LAUNCHER_APP.bundleId
    );
  }, [runningApps]);

  // Sorted apps for multitasking view (oldest first, most recent on the right)
  const sortedAppsForMultitasking = useMemo(() => {
    return [...nonLauncherApps].sort(
      (a, b) => a.lastForegroundedAt.getTime() - b.lastForegroundedAt.getTime()
    );
  }, [nonLauncherApps]);

  // Get the sort index for a given app (for card positioning)
  const getSortIndex = useCallback(
    (bundleId: string) => {
      return sortedAppsForMultitasking.findIndex(
        (app) => app.definition.bundleId === bundleId
      );
    },
    [sortedAppsForMultitasking]
  );

  // Track container size for positioning calculations
  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Track scroll position
  useLayoutEffect(() => {
    if (!scrollRef.current || !showMultitasking) return;
    const handleScroll = () => {
      if (scrollRef.current) {
        setScrollOffset(scrollRef.current.scrollLeft);
      }
    };
    scrollRef.current.addEventListener("scroll", handleScroll);
    return () => scrollRef.current?.removeEventListener("scroll", handleScroll);
  }, [showMultitasking]);

  // Scroll to the right when multitasking opens (most recent apps)
  useEffect(() => {
    if (showMultitasking && scrollRef.current) {
      // Use requestAnimationFrame to ensure the scroll container is rendered
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
          setScrollOffset(scrollRef.current.scrollLeft);
        }
      });
    }
  }, [showMultitasking]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setHasDragged(false);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeftStart(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    if (Math.abs(walk) > 5) {
      setHasDragged(true);
    }
    scrollRef.current.scrollLeft = scrollLeftStart - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCardClick = (app: RunningAppInstance) => {
    if (hasDragged) return;
    foregroundApp(app.definition);
    setMultitasking(false);
  };

  // Calculate card position for a given app index
  const getCardTransform = (index: number) => {
    const cardX = CARD_PADDING + index * (CARD_WIDTH + CARD_GAP) - scrollOffset;
    const cardY = (containerSize.height - CARD_HEIGHT) / 2;
    return {
      x: cardX,
      y: cardY,
      scale: CARD_SCALE,
    };
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 bg-foreground flex flex-col gap-2 relative overflow-hidden"
    >
      {/* Launcher layer - always rendered */}
      {launcherApp && (
        <div
          className={cn(
            "absolute inset-0 rounded-xl overflow-hidden transition-opacity duration-150",
            showMultitasking && "opacity-30"
          )}
        >
          <AppIframe app={launcherApp} setAppIframeRef={setAppIframeRef} />
        </div>
      )}

      {/* App iframes - rendered in stable order (not sorted) to preserve iframe state */}
      {nonLauncherApps.map((app) => {
        const sortIndex = getSortIndex(app.definition.bundleId);
        const cardTransform = getCardTransform(sortIndex);

        // In multitasking: position as cards
        // In normal mode: fullscreen with visibility based on isInBackground
        const multitaskingStyle: React.CSSProperties = {
          position: "absolute",
          left: 0,
          top: HEADER_HEIGHT,
          width: CARD_WIDTH / CARD_SCALE,
          height: CARD_HEIGHT / CARD_SCALE,
          transform: `translate(${cardTransform.x}px, ${cardTransform.y}px) scale(${cardTransform.scale})`,
          transformOrigin: "top left",
          zIndex: 20,
          pointerEvents: "none",
          borderRadius: "0.75rem",
          overflow: "hidden",
        };

        const normalStyle: React.CSSProperties = {
          position: "absolute",
          inset: 0,
          zIndex: 10,
        };

        return (
          <div
            key={app.definition.bundleId}
            className={cn(
              "bg-background overflow-hidden transition-all duration-200 ease-out",
              !showMultitasking && "rounded-xl",
              !showMultitasking &&
                (app.isInBackground
                  ? "scale-75 opacity-0 pointer-events-none"
                  : "animate-in zoom-in-75 fade-in-0 scale-100 opacity-100")
            )}
            style={showMultitasking ? multitaskingStyle : normalStyle}
          >
            <AppIframe app={app} setAppIframeRef={setAppIframeRef} />
          </div>
        );
      })}

      {/* Multitasking UI overlay - card headers and backgrounds */}
      {showMultitasking && (
        <div className="absolute inset-0 z-30 flex items-center pointer-events-none">
          {sortedAppsForMultitasking.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <span className="text-background/60 text-lg">
                No apps running
              </span>
            </div>
          ) : (
            <div
              ref={scrollRef}
              className="flex gap-4 px-8 overflow-x-auto w-full cursor-grab active:cursor-grabbing pointer-events-auto select-none"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {sortedAppsForMultitasking.map((app) => (
                <div
                  key={app.definition.bundleId}
                  className="flex-shrink-0 flex flex-col cursor-pointer"
                  onClick={() => handleCardClick(app)}
                >
                  {/* Card header */}
                  <div
                    className="flex items-center justify-between px-1 min-w-0"
                    style={{ height: HEADER_HEIGHT }}
                  >
                    <span className="text-background text-sm font-medium truncate">
                      {app.definition.name}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        closeApp(app.definition);
                      }}
                      className="p-1 rounded-full hover:bg-background/20 transition-colors flex-shrink-0"
                    >
                      <X className="w-4 h-4 text-background" />
                    </button>
                  </div>
                  {/* Card placeholder - iframe is positioned behind this */}
                  <div
                    className="rounded-xl shadow-lg"
                    style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
