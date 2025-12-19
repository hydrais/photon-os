import type { AppDefinition } from "@photon-os/sdk";

function getAppColor(bundleId: string): string {
  const colors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-amber-500",
    "bg-yellow-500",
    "bg-lime-500",
    "bg-green-500",
    "bg-emerald-500",
    "bg-teal-500",
    "bg-cyan-500",
    "bg-sky-500",
    "bg-blue-500",
    "bg-indigo-500",
    "bg-violet-500",
    "bg-purple-500",
    "bg-fuchsia-500",
    "bg-pink-500",
    "bg-rose-500",
  ];

  let hash = 0;
  for (let i = 0; i < bundleId.length; i++) {
    hash = bundleId.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}

function getInitials(name: string): string {
  const words = name.split(/\s+/);
  if (words.length === 1) {
    return name.substring(0, 2).toUpperCase();
  }
  return words
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function AppIcon({
  app,
  onClick,
}: {
  app: AppDefinition;
  onClick: () => void;
}) {
  const color = getAppColor(app.bundleId);
  const initials = getInitials(app.name);

  return (
    <button
      className="flex flex-col items-center gap-1.5 group"
      onClick={onClick}
    >
      <div
        className={`w-16 h-16 ${color} rounded-full flex items-center justify-center shadow-lg
          group-hover:scale-105 group-active:scale-95 transition-transform duration-150`}
      >
        <span className="text-white text-xl font-semibold drop-shadow-sm">
          {initials}
        </span>
      </div>
      <span className="text-xs text-white font-medium drop-shadow-md truncate max-w-[72px] text-center">
        {app.name}
      </span>
    </button>
  );
}
