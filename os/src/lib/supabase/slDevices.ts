import { supabase } from "./client";
import type { SLDevice, SendMessageResult, DeviceMessage } from "@photon-os/sdk";
import type { RealtimeChannel } from "@supabase/supabase-js";

type SlRegisteredDeviceRow = {
  id: string;
  user_id: string;
  sl_account_id: string;
  object_key: string;
  object_name: string;
  callback_url: string;
  region_name: string | null;
  registered_at: string;
  last_heartbeat_at: string;
  is_online: boolean;
  metadata: Record<string, unknown>;
};

function rowToSLDevice(row: SlRegisteredDeviceRow): SLDevice {
  return {
    id: row.id,
    objectKey: row.object_key,
    objectName: row.object_name,
    regionName: row.region_name ?? undefined,
    isOnline: row.is_online,
    lastHeartbeatAt: new Date(row.last_heartbeat_at),
    registeredAt: new Date(row.registered_at),
    metadata: row.metadata,
  };
}

export async function fetchRegisteredDevices(userId: string): Promise<SLDevice[]> {
  const { data, error } = await supabase
    .from("sl_registered_devices")
    .select("*")
    .eq("user_id", userId)
    .order("registered_at", { ascending: true });

  if (error) {
    console.error("Failed to fetch registered devices:", error);
    throw error;
  }

  return (data ?? []).map(rowToSLDevice);
}

export async function deleteRegisteredDevice(
  userId: string,
  deviceId: string
): Promise<void> {
  const { error } = await supabase
    .from("sl_registered_devices")
    .delete()
    .eq("user_id", userId)
    .eq("id", deviceId);

  if (error) {
    console.error("Failed to delete registered device:", error);
    throw error;
  }
}

export async function sendMessageToDevice(
  deviceId: string,
  type: string,
  payload: Record<string, unknown>
): Promise<SendMessageResult> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  // Get current session for auth
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;

  if (!accessToken) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/send-to-sl-device`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ device_id: deviceId, type, payload }),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || "Failed to send message",
        deviceOffline: result.device_offline,
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to send message to device:", error);
    return { success: false, error: "Network error" };
  }
}

// Realtime subscription management
let activeChannel: RealtimeChannel | null = null;
let activeCallback: ((message: DeviceMessage) => void) | null = null;

export function subscribeToDeviceMessages(
  userId: string,
  callback: (message: DeviceMessage) => void
): void {
  // Unsubscribe from any existing channel
  if (activeChannel) {
    supabase.removeChannel(activeChannel);
  }

  activeCallback = callback;
  activeChannel = supabase
    .channel(`sl-messages:${userId}`)
    .on("broadcast", { event: "device_message" }, (payload) => {
      if (activeCallback && payload.payload) {
        const msg = payload.payload as {
          device_id: string;
          object_key: string;
          object_name: string;
          type: string;
          payload: Record<string, unknown>;
          timestamp: string;
        };

        activeCallback({
          deviceId: msg.device_id,
          objectKey: msg.object_key,
          objectName: msg.object_name,
          type: msg.type,
          payload: msg.payload,
          timestamp: new Date(msg.timestamp),
        });
      }
    })
    .subscribe();
}

export function unsubscribeFromDeviceMessages(): void {
  if (activeChannel) {
    supabase.removeChannel(activeChannel);
    activeChannel = null;
  }
  activeCallback = null;
}
