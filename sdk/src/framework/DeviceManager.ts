import type {
  DeviceMessage,
  DeviceMessageCallback,
  SendMessageResult,
  SLDevice,
  Unsubscribe,
} from "../types/devices";
import type { OS } from "./OS";

export class DeviceManager {
  private os: OS;
  private messageCallbacks: { [deviceId: string]: Set<DeviceMessageCallback> } =
    {};
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
  public subscribeToMessages(
    deviceId: string,
    callback: DeviceMessageCallback
  ): Unsubscribe {
    this.messageCallbacks[deviceId] = this.messageCallbacks[deviceId] ?? [];
    this.messageCallbacks[deviceId].add(callback);

    // Start subscription if this is the first callback
    if (!this.subscribed) {
      this.startSubscription();
    }

    // Return unsubscribe function
    return () => {
      if (this.messageCallbacks[deviceId]) {
        this.messageCallbacks[deviceId].delete(callback);
      }

      // Stop subscription if no more callbacks
      const totalSubscriptions = Object.values(this.messageCallbacks).reduce(
        (acc, cv) => acc + cv.size,
        0
      );

      if (totalSubscriptions === 0 && this.subscribed) {
        this.stopSubscription();
      }
    };
  }

  /** Internal: Start the message subscription via RPC */
  private async startSubscription(): Promise<void> {
    const api = await this.os.getRPCAPI();
    await api.devices_subscribe((message: DeviceMessage) => {
      const callbacks = this.messageCallbacks[message.deviceId] ?? [];

      // Forward to all registered callbacks for device
      for (const callback of callbacks) {
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
