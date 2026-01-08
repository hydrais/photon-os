import type { PropsWithChildren, ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AuthCardProps extends PropsWithChildren {
  className?: string;
  headerLeft?: ReactNode;
}

export function AuthCard({ children, className, headerLeft }: AuthCardProps) {
  return (
    <Card
      className={cn(
        "w-full max-w-md animate-in zoom-in-95 fade-in-0 duration-300",
        className
      )}
    >
      <div className="relative flex justify-center pt-6">
        {headerLeft && (
          <div className="absolute left-6 top-6">{headerLeft}</div>
        )}
        <img
          src="/photon-logo.svg"
          alt="Photon OS"
          className="h-12 w-12 dark:invert"
        />
      </div>
      <CardContent className="flex flex-col gap-6">{children}</CardContent>
    </Card>
  );
}
