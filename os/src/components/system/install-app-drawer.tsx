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
