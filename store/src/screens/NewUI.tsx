import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  List,
  MoreHorizontal,
  Ribbon,
  Search,
  Shirt,
  Sparkle,
  Star,
  ThumbsUp,
  ToolCase,
} from "lucide-react";

export function NewUI() {
  return (
    <div className="h-screen flex flex-col">
      <header className="border-b flex flex-col gap-4 p-4 md:flex-row">
        <InputGroup className="h-auto p-2 gap-3 rounded-lg">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput placeholder="Search apps..." />
        </InputGroup>
        <Tabs>
          <TabsList className="flex-1 w-full">
            <TabsTrigger value="home1" className="p-2 rounded-full">
              <Star /> Featured
            </TabsTrigger>
            <TabsTrigger value="home2" className="p-2 rounded-full">
              <ThumbsUp /> Top Rated
            </TabsTrigger>
            <TabsTrigger value="home3" className="p-2 rounded-full">
              <Sparkle /> Newly Released
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </header>
      <main className="flex-1 bg-gray-50 p-4">Body</main>
      <footer className="border-t p-3 flex flex-row gap-4 justify-around">
        <button className="cursor-pointer flex flex-col gap-1 text-primary hover:text-primary">
          <div className="bg-primary/10 p-2 rounded-full flex items-center justify-center">
            <Star className="size-5" />
          </div>
          <p className="text-sm font-medium">Discover</p>
        </button>

        <button className="cursor-pointer flex flex-col gap-1 text-muted-foreground hover:text-primary">
          <div className="p-2 rounded-full flex items-center justify-center">
            <Shirt className="size-5" />
          </div>
          <p className="text-sm font-medium">Avatar</p>
        </button>

        <button className="cursor-pointer flex flex-col gap-1 text-muted-foreground hover:text-primary">
          <div className="p-2 rounded-full flex items-center justify-center">
            <ToolCase className="size-5" />
          </div>
          <p className="text-sm font-medium">Tools</p>
        </button>
        <button className="cursor-pointer flex flex-col gap-1 text-muted-foreground hover:text-primary">
          <div className="p-2 rounded-full flex items-center justify-center">
            <MoreHorizontal className="size-5" />
          </div>
          <p className="text-sm font-medium">More</p>
        </button>
      </footer>
    </div>
  );
}
