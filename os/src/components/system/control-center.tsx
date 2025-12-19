import { Link } from "lucide-react";
import { Button } from "../ui/button";

export function ControlCenter() {
  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-center text-xs font-medium text-muted-foreground">
        Control Center
      </h4>
      <div className="flex flex-row gap-2">
        <Button className="h-12 rounded-full bg-primary text-background justify-start px-2 flex-1">
          <div className="bg-white text-primary rounded-full p-2">
            <Link />
          </div>
          <span className="flex-1 text-center -ml-8">Photon Tool</span>
        </Button>
      </div>
      {/* <div className="flex flex-row gap-2">
        <Button className="h-12 rounded-full bg-primary text-background justify-start px-2 flex-1">
          <div className="bg-white text-primary rounded-full p-2">
            <Wifi />
          </div>
          <span className="flex-1 text-center -ml-2">Wireless</span>
        </Button>
        <Button className="h-12 rounded-full bg-primary text-background justify-start px-2 flex-1">
          <div className="bg-white text-primary rounded-full p-2">
            <Bluetooth />
          </div>
          <span className="flex-1 text-center -ml-2">Bluetooth</span>
        </Button>
      </div> */}
    </div>
  );
}
