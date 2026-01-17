import { useState } from "react";
import type { AppDefinition } from "@photon-os/sdk";

export function AppInfoIcon({ app }: { app: AppDefinition }) {
  const [iconError, setIconError] = useState(false);
  const showIcon = app.icon && !iconError;

  return (
    <div className="size-16 mx-auto mb-4 rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-2xl font-semibold overflow-hidden">
      {showIcon ? (
        <img
          src={app.icon}
          alt={app.name}
          className="w-full h-full object-cover"
          onError={() => setIconError(true)}
        />
      ) : (
        app.name.charAt(0).toUpperCase()
      )}
    </div>
  );
}
