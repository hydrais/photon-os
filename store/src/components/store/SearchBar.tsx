import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  loading?: boolean;
};

export function SearchBar({ value, onChange, loading }: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search apps..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9"
        aria-label="Search apps"
      />
      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="size-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
