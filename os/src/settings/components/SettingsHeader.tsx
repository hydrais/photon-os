import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SettingsHeaderProps {
  title: string;
  onBack: () => void;
}

export function SettingsHeader({ title, onBack }: SettingsHeaderProps) {
  return (
    <header className="flex items-center gap-3 p-4 border-b border-border bg-background/80 backdrop-blur-sm">
      <Button
        variant="ghost"
        size="icon"
        onClick={onBack}
        className="rounded-full"
      >
        <ArrowLeft className="size-5" />
      </Button>
      <h1 className="text-lg font-semibold">{title}</h1>
    </header>
  );
}
