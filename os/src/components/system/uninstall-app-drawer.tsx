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
