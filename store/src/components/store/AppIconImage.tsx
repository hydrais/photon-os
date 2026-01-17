import { useState } from "react";

type AppIconImageProps = {
  iconUrl: string | null;
  appName: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: "size-10 text-base",
  md: "size-14 text-xl",
  lg: "size-20 text-3xl",
};

export function AppIconImage({
  iconUrl,
  appName,
  size = "md",
  className = "",
}: AppIconImageProps) {
  const [iconError, setIconError] = useState(false);
  const showIcon = iconUrl && !iconError;
  const sizeClass = sizeClasses[size];

  return (
    <div
      className={`${sizeClass} shrink-0 rounded-lg bg-muted flex items-center justify-center text-muted-foreground font-semibold overflow-hidden ${className}`}
    >
      {showIcon ? (
        <img
          src={iconUrl}
          alt={appName}
          className="w-full h-full object-cover"
          onError={() => setIconError(true)}
        />
      ) : (
        appName.charAt(0).toUpperCase()
      )}
    </div>
  );
}
