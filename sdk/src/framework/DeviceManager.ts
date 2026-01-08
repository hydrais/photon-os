import type { DeviceMessage, DeviceMessageCallback, SendMessageResult, SLDevice, Unsubscribe } from "../types/devices";
import type { OS } from "./OS";

export class DeviceManager {
  private os: OS;
  private messageCallbacks: Set<DeviceMessageCallback> = new Set();
  private subscribed: boolean = false;

  constructor(os: OS) {
    this.os = os;
  }

  /** Get all registered Second Life devices for the current user */
  public async getRegisteredDevices(): Promise<SLDevice[]> {
    const api = await this.os.getRPCAPI();
    return await api.devices_getRegistered();
  }

  /** Send a message to a registered device */
  public async sendMessage(
    deviceId: string,
    type: string,
    payload: Record<string, unknown> = {}
  ): Promise<SendMessageResult> {
    const api = await this.os.getRPCAPI();
    return await api.devices_sendMessage(deviceId, type, payload);
  }

  /** Unregister a device */
  public async unregisterDevice(deviceId: string): Promise<void> {
    const api = await this.os.getRPCAPI();
    await api.devices_unregister(deviceId);
  }

  /** Subscribe to messages from all registered devices */
  public subscribeToMessages(callback: DeviceMessageCallback): Unsubscribe {
    this.messageCallbacks.add(callback);

    // Start subscription if this is the first callback
    if (!this.subscribed) {
      this.startSubscription();
    }

    // Return unsubscribe function
    return () => {
      this.messageCallbacks.delete(callback);
      // Stop subscription if no more callbacks
      if (this.messageCallbacks.size === 0 && this.subscribed) {
        this.stopSubscription();
      }
    };
  }

  /** Internal: Start the message subscription via RPC */
  private async startSubscription(): Promise<void> {
    const api = await this.os.getRPCAPI();
    await api.devices_subscribe((message: DeviceMessage) => {
      // Forward to all registered callbacks
      for (const callback of this.messageCallbacks) {
        try {
          callback(message);
        } catch (error) {
          console.error("Error in device message callback:", error);
        }
      }
    });
    this.subscribed = true;
  }

  /** Internal: Stop the message subscription */
  private async stopSubscription(): Promise<void> {
    const api = await this.os.getRPCAPI();
    await api.devices_unsubscribe();
    this.subscribed = false;
  }
}
