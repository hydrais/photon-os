import { useState } from "react";
import type { AppDefinition } from "@photon-os/sdk";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Info, Trash2 } from "lucide-react";

export function AppIcon({
  app,
  onClick,
  onAppInfo,
  onUninstall,
  canBeUninstalled = true,
}: {
  app: AppDefinition;
  onClick: () => void;
  onAppInfo: () => void;
  onUninstall: () => void;
  canBeUninstalled?: boolean;
}) {
  const [iconError, setIconError] = useState(false);
  const showIcon = app.icon && !iconError;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <button
          className="flex flex-col items-center gap-1.5 group"
          onClick={onClick}
        >
          <div
            className={`w-12 h-12 rounded-lg bg-muted flex items-center justify-center shadow-lg overflow-hidden
              group-hover:scale-105 group-active:scale-95 transition-transform duration-150`}
          >
            {showIcon ? (
              <img
                src={app.icon}
                alt={app.name}
                className="w-full h-full object-cover"
                onError={() => setIconError(true)}
              />
            ) : (
              <span className="text-muted-foreground text-xl font-semibold">
                {app.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <span className="text-xs text-white font-medium drop-shadow-md truncate max-w-[72px] text-center">
            {app.name}
          </span>
        </button>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onSelect={onAppInfo}>
          <Info />
          App Info
        </ContextMenuItem>
        {canBeUninstalled && (
          <ContextMenuItem variant="destructive" onSelect={onUninstall}>
            <Trash2 />
            Uninstall
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
