import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "../ui/button";
import type { PermissionType } from "@/lib/supabase/permissions";
import { Cpu } from "lucide-react";

type PermissionInfo = {
  title: string;
  description: string;
  icon: React.ReactNode;
};

const PERMISSION_INFO: Record<PermissionType, PermissionInfo> = {
  devices: {
    title: "Device Access",
    description:
      "This app wants to access your connected Second Life devices. This includes viewing registered devices and sending/receiving messages.",
    icon: <Cpu className="size-8" />,
  },
};

export type PermissionRequest = {
  bundleId: string;
  appName: string;
  permissionType: PermissionType;
  resolve: (granted: boolean) => void;
};

export function PermissionDrawer({
  request,
  onAllow,
  onDeny,
}: {
  request: PermissionRequest | null;
  onAllow: () => void;
  onDeny: () => void;
}) {
  if (!request) return null;

  const info = PERMISSION_INFO[request.permissionType];

  return (
    <Drawer open={Boolean(request)} onClose={onDeny}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <div className="flex justify-center mb-2 text-muted-foreground">
              {info.icon}
            </div>
            <DrawerTitle>"{request.appName}" wants {info.title}</DrawerTitle>
            <DrawerDescription>{info.description}</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <Button onClick={onAllow} size="lg">
              Allow
            </Button>
            <Button variant="outline" size="lg" onClick={onDeny}>
              Don't Allow
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
