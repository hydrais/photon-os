import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import type { AppDefinition } from "@photon-os/sdk";
import { Button } from "../ui/button";

function AppIcon({ app }: { app: AppDefinition | null }) {
  const [iconError, setIconError] = useState(false);
  if (!app) return null;

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

export function InstallAppDrawer({
  app,
  suggestedBy,
  type = "permanent",
  onInstall,
  onDecline,
}: {
  app: AppDefinition | null;
  suggestedBy?: {
    deviceId: string;
    objectName: string;
  };
  type: "permanent" | "temporary";
  onInstall: () => void;
  onDecline: () => void;
}) {
  const getDescription = () => {
    if (suggestedBy) {
      return `${suggestedBy.objectName} is suggesting you install ${app?.name} by ${app?.author}. Only install apps you trust.`;
    }
    if (type === "permanent") {
      return `An app called ${app?.name} by ${app?.author} is requesting to be installed on your device. Only install apps you trust.`;
    }
    return `An app called ${app?.name} by ${app?.author} is requesting to temporarily run on your device to enhance your experience in this location. Only run apps you trust.`;
  };

  return (
    <Drawer open={Boolean(app)} onClose={onDecline}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <AppIcon app={app} />
            <DrawerTitle>
              {type === "permanent"
                ? `Install ${app?.name}`
                : `Run ${app?.name}`}
            </DrawerTitle>
            <DrawerDescription>{getDescription()}</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <Button onClick={onInstall} size="lg">
              {type === "permanent" ? `Install App` : `Launch App`}
            </Button>

            <Button variant="outline" size="lg" onClick={onDecline}>
              {type === "permanent" ? "Do not Install" : "Do not Launch"}
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
