import { useState, useEffect } from "react";
import { OS, type SLDevice, type DeviceMessage } from "@photon-os/sdk";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

const os = new OS();

export function MainScreen() {
  const [devices, setDevices] = useState<SLDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [incomingMessages, setIncomingMessages] = useState<DeviceMessage[]>([]);

  useEffect(() => {
    os.devices.getRegisteredDevices().then((result) => {
      setDevices(result);
      setLoading(false);
    });

    // Subscribe to incoming messages from devices
    const unsubscribe = os.devices.subscribeToMessages((msg) => {
      setIncomingMessages((prev) => [...prev.slice(-9), msg]); // Keep last 10
    });

    return () => unsubscribe();
  }, []);

  const handleSend = async () => {
    if (!selectedDeviceId || !message.trim()) return;

    setSending(true);
    setError(null);

    try {
      const result = await os.devices.sendMessage(selectedDeviceId, "chat", {
        text: message.trim(),
      });

      if (result.success) {
        setMessage("");
      } else {
        setError(result.error || "Failed to send message");
      }
    } catch (err) {
      setError("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const selectedDevice = devices.find((d) => d.id === selectedDeviceId);

  return (
    <div className="fixed inset-0 bg-stone-200 flex flex-col p-4 gap-4">
      <h1 className="text-lg font-semibold">Send Message to Device</h1>

      {loading ? (
        <div className="flex items-center justify-center flex-1">
          <Spinner />
        </div>
      ) : devices.length === 0 ? (
        <div className="text-center text-muted-foreground flex-1 flex items-center justify-center">
          No devices connected. Add a PhotonDevice script to an object in Second
          Life.
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Device</label>
            <Select value={selectedDeviceId} onValueChange={setSelectedDeviceId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a device..." />
              </SelectTrigger>
              <SelectContent>
                {devices.map((device) => (
                  <SelectItem key={device.id} value={device.id}>
                    <span
                      className={`inline-block w-2 h-2 rounded-full mr-2 ${
                        device.isOnline ? "bg-green-500" : "bg-gray-400"
                      }`}
                    />
                    {device.objectName}
                    {device.regionName && (
                      <span className="text-muted-foreground ml-1">
                        ({device.regionName})
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2 flex-1">
            <label className="text-sm font-medium">Message</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 resize-none"
              disabled={!selectedDeviceId || sending}
            />
          </div>

          {error && (
            <div className="text-sm text-destructive">{error}</div>
          )}

          <Button
            onClick={handleSend}
            disabled={!selectedDeviceId || !message.trim() || sending}
            className="w-full"
          >
            {sending ? <Spinner className="size-4" /> : "Send"}
          </Button>

          {selectedDevice && !selectedDevice.isOnline && (
            <div className="text-sm text-amber-600 text-center">
              This device appears to be offline
            </div>
          )}

          {incomingMessages.length > 0 && (
            <div className="flex flex-col gap-2 mt-4">
              <label className="text-sm font-medium">Incoming Messages</label>
              <div className="bg-white rounded-md border p-2 max-h-40 overflow-y-auto">
                {incomingMessages.map((msg, idx) => (
                  <div key={idx} className="text-sm py-1 border-b last:border-b-0">
                    <span className="text-muted-foreground">[{msg.type}]</span>{" "}
                    {typeof msg.payload === "object"
                      ? JSON.stringify(msg.payload)
                      : String(msg.payload)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
