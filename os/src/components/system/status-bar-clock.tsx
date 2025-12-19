import { format } from "date-fns";
import { useEffect, useState } from "react";

export function StatusBarClock({
  showSeconds,
  clockType,
}: {
  showSeconds: boolean;
  clockType: "12-hour" | "24-hour";
}) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const formattedTime =
    clockType === "12-hour"
      ? showSeconds
        ? format(time, "h:mm:ss a")
        : format(time, "h:mm a")
      : showSeconds
      ? format(time, "H:mm:ss")
      : format(time, "H:m");

  return <div className="text-sm font-medium">{formattedTime}</div>;
}
