import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PhotonNavBarBackButton({ onClick }: { onClick: () => void }) {
  return (
    <Button onClick={onClick} variant="secondary" size="icon-lg">
      <ArrowLeft />
    </Button>
  );
}
