import { useState, useEffect, useRef } from "react";
import { OS, type SLDevice } from "@photon-os/sdk";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  SendIcon,
  XIcon,
  TerminalIcon,
  WifiIcon,
  WifiOffIcon,
  HelpCircleIcon,
} from "lucide-react";

const os = new OS();
const HISTORY_KEY = "commandHistory";

function findPhotonTool(devices: SLDevice[]): SLDevice | undefined {
  return devices.find((d) => {
    const name = d.objectName.toLowerCase();
    return name.includes("photon") && name.includes("tool");
  });
}

export function MainScreen() {
  const [loading, setLoading] = useState(true);
  const [connectedDevice, setConnectedDevice] = useState<SLDevice | null>(null);
  const [command, setCommand] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const historyEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load devices and saved history
  useEffect(() => {
    Promise.all([
      os.devices.getRegisteredDevices(),
      os.prefs.get(HISTORY_KEY),
    ]).then(([devices, savedHistory]) => {
      const device = findPhotonTool(devices);
      setConnectedDevice(device ?? null);
      if (
        Array.isArray(savedHistory) &&
        savedHistory.every((item) => typeof item === "string")
      ) {
        setCommandHistory(savedHistory as string[]);
      }
      setLoading(false);
    });
  }, []);

  // Save history when it changes
  useEffect(() => {
    if (!loading) {
      os.prefs.set(HISTORY_KEY, commandHistory);
    }
  }, [commandHistory, loading]);

  // Scroll to bottom when history updates
  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [commandHistory]);

  const sendCommand = async (cmd: string) => {
    if (!connectedDevice || !cmd.trim()) return;

    setSending(true);
    setError(null);

    try {
      const result = await os.devices.sendMessage(
        connectedDevice.id,
        "command",
        {
          command: cmd.trim(),
        }
      );

      if (result.success) {
        setCommandHistory((prev) => [...prev, cmd.trim()]);
        setCommand("");
        inputRef.current?.focus();
      } else {
        setError(result.error || "Failed to send command");
      }
    } catch {
      setError("Failed to send command");
    } finally {
      setSending(false);
    }
  };

  const removeCommand = (index: number) => {
    setCommandHistory((prev) => prev.filter((_, i) => i !== index));
  };

  const sendSilentCommand = async (cmd: string) => {
    if (!connectedDevice || !cmd.trim()) return;
    await os.devices.sendMessage(connectedDevice.id, "command", {
      command: cmd.trim(),
    });
  };

  const handleSend = () => sendCommand(command);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="fixed inset-0 bg-stone-100 flex items-center justify-center">
        <Spinner className="text-stone-400" />
      </div>
    );
  }

  // No device found
  if (!connectedDevice) {
    return (
      <div className="fixed inset-0 bg-stone-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-stone-200 flex items-center justify-center mb-4">
          <WifiOffIcon className="w-8 h-8 text-stone-400" />
        </div>
        <p className="text-stone-700 font-medium">Not Connected</p>
        <p className="text-sm text-stone-500 mt-1 max-w-[240px]">
          Make sure your Photon Tool is attached to your avatar.
        </p>
      </div>
    );
  }

  // Connected - show chat interface
  return (
    <div className="fixed inset-0 bg-stone-100 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-stone-200">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-sm shadow-violet-500/20">
          <TerminalIcon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-base font-semibold text-stone-900">
            Photon Tool
          </h1>
          <div className="flex items-center gap-1.5 text-xs">
            {connectedDevice.isOnline ? (
              <>
                <WifiIcon className="w-3 h-3 text-emerald-500" />
                <span className="text-emerald-600">Connected</span>
              </>
            ) : (
              <>
                <WifiOffIcon className="w-3 h-3 text-stone-400" />
                <span className="text-stone-500">Offline</span>
              </>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon-lg"
          onClick={() => sendSilentCommand("help")}
        >
          <HelpCircleIcon className="w-5 h-5" />
        </Button>
      </div>

      {/* Command history */}
      <div className="flex-1 overflow-y-auto p-4 pb-24">
        {commandHistory.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-stone-400">
            <TerminalIcon className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">No commands yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {commandHistory.map((cmd, idx) => (
              <div
                key={idx}
                className="group flex items-center gap-2 bg-white hover:bg-stone-50 rounded-lg border border-stone-200 shadow-sm transition-colors"
              >
                <button
                  onClick={() => sendCommand(cmd)}
                  disabled={sending}
                  className="flex-1 text-left text-sm text-stone-700 px-3 py-2.5 font-mono disabled:opacity-50"
                >
                  <span className="text-violet-500 mr-2">$</span>
                  {cmd}
                </button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => removeCommand(idx)}
                  className="mr-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <XIcon className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <div ref={historyEndRef} />
          </div>
        )}
      </div>

      {/* Floating input */}
      <div className="absolute bottom-4 left-4 right-4">
        {error && <div className="text-sm text-red-500 mb-2 px-1">{error}</div>}
        <div className="flex gap-2">
          <InputGroup className="flex-1 bg-white shadow-sm">
            <InputGroupAddon className="font-mono">$</InputGroupAddon>
            <InputGroupInput
              ref={inputRef}
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter command..."
              disabled={sending}
              className="font-mono text-xs"
            />
          </InputGroup>
          <Button
            size="icon-lg"
            onClick={handleSend}
            disabled={!command.trim() || sending}
            className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 shadow-sm shadow-violet-500/25"
          >
            {sending ? (
              <Spinner className="w-4 h-4" />
            ) : (
              <SendIcon className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
