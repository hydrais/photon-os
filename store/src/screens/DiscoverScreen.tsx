import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Sparkle, Star, ThumbsUp } from "lucide-react";

export function DiscoverScreen() {
  return (
    <>
      <header className="border-b flex flex-col gap-2 p-2 md:flex-row">
        <InputGroup className="h-auto p-0.5 gap-2 rounded-lg">
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
              <Sparkle /> New
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </header>
      <main className="flex-1 bg-gray-50 p-2">Body</main>
    </>
  );
}
