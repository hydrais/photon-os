/** A registered Second Life device */
export interface SLDevice {
  id: string;
  objectKey: string;
  objectName: string;
  regionName?: string;
  isOnline: boolean;
  lastHeartbeatAt: Date;
  registeredAt: Date;
  metadata?: Record<string, unknown>;
}

/** A message received from a Second Life device */
export interface DeviceMessage {
  deviceId: string;
  objectKey: string;
  objectName: string;
  type: string;
  payload: Record<string, unknown>;
  timestamp: Date;
}

/** Result of sending a message to a device */
export interface SendMessageResult {
  success: boolean;
  error?: string;
  deviceOffline?: boolean;
}

/** Callback for receiving device messages */
export type DeviceMessageCallback = (message: DeviceMessage) => void;

/** Function to unsubscribe from device messages */
export type Unsubscribe = () => void;
