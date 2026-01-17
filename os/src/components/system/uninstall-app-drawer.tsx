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

export function UninstallAppDrawer({
  app,
  onUninstall,
  onDecline,
}: {
  app: AppDefinition | null;
  onUninstall: () => void;
  onDecline: () => void;
}) {
  return (
    <Drawer open={Boolean(app)} onClose={onDecline}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <AppIcon app={app} />
            <DrawerTitle>Uninstall {app?.name}</DrawerTitle>
            <DrawerDescription>
              Are you sure you would like to uninstall {app?.name} by{" "}
              {app?.author}?
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <Button onClick={onUninstall} size="lg">
              Uninstall App
            </Button>

            <Button variant="outline" size="lg" onClick={onDecline}>
              Keep App
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
