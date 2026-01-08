import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  fetchRegisteredDevices,
  deleteRegisteredDevice,
} from "@/lib/supabase/slDevices";
import type { SLDevice } from "@photon-os/sdk";
import { formatDistanceToNow } from "date-fns";

function DeviceItem({
  device,
  onUnregister,
  isUnregistering,
}: {
  device: SLDevice;
  onUnregister: () => void;
  isUnregistering: boolean;
}) {
  return (
    <div className="p-4 flex items-center gap-4">
      <div
        className={`w-3 h-3 rounded-full flex-shrink-0 ${
          device.isOnline ? "bg-green-500" : "bg-muted-foreground/30"
        }`}
        title={device.isOnline ? "Online" : "Offline"}
      />
      <div className="min-w-0 flex-1">
        <p className="font-medium text-lg truncate">{device.objectName}</p>
        <p className="text-xs text-muted-foreground">
          {device.regionName && <span>{device.regionName} &middot; </span>}
          Last seen {formatDistanceToNow(device.lastHeartbeatAt, { addSuffix: true })}
        </p>
      </div>
      <Button
        variant="destructive"
        className="ml-auto flex-shrink-0"
        onClick={onUnregister}
        disabled={isUnregistering}
      >
        {isUnregistering ? <Loader2 className="animate-spin" /> : "Remove"}
      </Button>
    </div>
  );
}

export function ConnectedDevicesSection() {
  const { user } = useAuth();
  const [devices, setDevices] = useState<SLDevice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unregisteringId, setUnregisteringId] = useState<string | null>(null);
  const [deviceToUnregister, setDeviceToUnregister] = useState<SLDevice | null>(
    null
  );

  const loadDevices = useCallback(async () => {
    if (!user) return [];
    try {
      const result = await fetchRegisteredDevices(user.id);
      return result;
    } catch (error) {
      console.error("Failed to load devices:", error);
      return [];
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    async function initialLoad() {
      const result = await loadDevices();
      if (!cancelled) {
        setDevices(result);
        setIsLoading(false);
      }
    }

    initialLoad();

    return () => {
      cancelled = true;
    };
  }, [user, loadDevices]);

  const handleUnregister = async () => {
    if (!user || !deviceToUnregister) return;

    const deviceId = deviceToUnregister.id;
    setDeviceToUnregister(null);
    setUnregisteringId(deviceId);

    try {
      await deleteRegisteredDevice(user.id, deviceId);
      setDevices((prev) => prev.filter((d) => d.id !== deviceId));
    } catch (error) {
      console.error("Failed to unregister device:", error);
    } finally {
      setUnregisteringId(null);
    }
  };

  return (
    <div className="flex flex-col gap-4 max-w-xl mx-auto">
      <div>
        <h2 className="text-lg font-semibold">Connected Devices</h2>
        <p className="text-sm text-muted-foreground">
          Second Life objects that are registered to communicate with your
          Photon account.
        </p>
      </div>

      <div className="rounded-2xl bg-card ring-1 ring-foreground/10 divide-y">
        {isLoading ? (
          <div className="p-4 flex items-center justify-center">
            <Loader2 className="animate-spin" />
          </div>
        ) : devices.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No devices connected yet. Drop a PhotonDevice script into an object
            in Second Life to get started.
          </div>
        ) : (
          devices.map((device) => (
            <DeviceItem
              key={device.id}
              device={device}
              onUnregister={() => setDeviceToUnregister(device)}
              isUnregistering={unregisteringId === device.id}
            />
          ))
        )}
      </div>

      <Drawer
        open={Boolean(deviceToUnregister)}
        onClose={() => setDeviceToUnregister(null)}
      >
        <DrawerContent>
          <div className="mx-auto w-full max-w-sm">
            <DrawerHeader>
              <DrawerTitle>Remove {deviceToUnregister?.objectName}?</DrawerTitle>
              <DrawerDescription>
                This device will no longer be able to send or receive messages
                through your Photon account. You can re-register it at any time
                by resetting the script.
              </DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <Button onClick={handleUnregister} variant="destructive" size="lg">
                Remove Device
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setDeviceToUnregister(null)}
              >
                Cancel
              </Button>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
