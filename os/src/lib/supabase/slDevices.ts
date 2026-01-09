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
let activeUserId: string | null = null;
const activeCallbacks: Set<(message: DeviceMessage) => void> = new Set();

function parseDeviceMessage(payload: unknown): DeviceMessage | null {
  if (!payload) return null;
  const msg = payload as {
    device_id: string;
    object_key: string;
    object_name: string;
    type: string;
    payload: Record<string, unknown>;
    timestamp: string;
  };
  return {
    deviceId: msg.device_id,
    objectKey: msg.object_key,
    objectName: msg.object_name,
    type: msg.type,
    payload: msg.payload,
    timestamp: new Date(msg.timestamp),
  };
}

function ensureChannel(userId: string): void {
  if (activeChannel && activeUserId === userId) {
    console.log("[slDevices] Channel already exists for user:", userId);
    return;
  }

  // Clean up existing channel if user changed
  if (activeChannel) {
    console.log("[slDevices] Cleaning up old channel for user:", activeUserId);
    supabase.removeChannel(activeChannel);
  }

  console.log("[slDevices] Creating channel for user:", userId);
  activeUserId = userId;
  activeChannel = supabase
    .channel(`sl-messages:${userId}`)
    .on("broadcast", { event: "device_message" }, (payload) => {
      console.log("[slDevices] Received broadcast:", payload);
      const message = parseDeviceMessage(payload.payload);
      if (message) {
        console.log("[slDevices] Parsed message:", message);
        console.log("[slDevices] Notifying", activeCallbacks.size, "callbacks");
        for (const cb of activeCallbacks) {
          try {
            cb(message);
          } catch (e) {
            console.error("Error in device message callback:", e);
          }
        }
      }
    })
    .subscribe((status) => {
      console.log("[slDevices] Channel subscription status:", status);
    });
}

function cleanupChannelIfEmpty(): void {
  if (activeCallbacks.size === 0 && activeChannel) {
    supabase.removeChannel(activeChannel);
    activeChannel = null;
    activeUserId = null;
  }
}

export function addDeviceMessageListener(
  userId: string,
  callback: (message: DeviceMessage) => void
): () => void {
  activeCallbacks.add(callback);
  ensureChannel(userId);

  return () => {
    activeCallbacks.delete(callback);
    cleanupChannelIfEmpty();
  };
}

export function subscribeToDeviceMessages(
  userId: string,
  callback: (message: DeviceMessage) => void
): void {
  activeCallbacks.add(callback);
  ensureChannel(userId);
}

export function unsubscribeFromDeviceMessages(): void {
  activeCallbacks.clear();
  if (activeChannel) {
    supabase.removeChannel(activeChannel);
    activeChannel = null;
    activeUserId = null;
  }
}
