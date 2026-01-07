import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { Button } from "@/components/ui/button";
import {
  fetchSharedPreference,
  setSharedPreference,
  deleteSharedPreference,
} from "@/lib/supabase/preferences";
import { cn } from "@/lib/utils";

type PicsumImage = {
  id: string;
  author: string;
  width: number;
  height: number;
  url: string;
  download_url: string;
};

const BACKGROUND_PREF_KEY = "launcher_background_url";

export function AppearanceSection() {
  const { user } = useAuth();
  const [images, setImages] = useState<PicsumImage[]>([]);
  const [currentBackground, setCurrentBackground] = useState<string | null>(null);
  const [loadingImages, setLoadingImages] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(
          "https://picsum.photos/v2/list?page=1&limit=12"
        );
        const data = await response.json();
        setImages(data);

        if (user) {
          const url = await fetchSharedPreference(user.id, BACKGROUND_PREF_KEY);
          setCurrentBackground(url as string | null);
        }
      } catch (error) {
        console.error("Failed to load background images:", error);
      } finally {
        setLoadingImages(false);
      }
    }
    load();
  }, [user]);

  const selectBackground = async (image: PicsumImage) => {
    if (!user) return;
    const imageUrl = `https://picsum.photos/id/${image.id}/1920/1080`;
    await setSharedPreference(user.id, BACKGROUND_PREF_KEY, imageUrl);
    setCurrentBackground(imageUrl);
  };

  const resetBackground = async () => {
    if (!user) return;
    await deleteSharedPreference(user.id, BACKGROUND_PREF_KEY);
    setCurrentBackground(null);
  };

  const currentImageId = currentBackground?.match(/\/id\/(\d+)\//)?.[1] ?? null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">Launcher Background</h2>
        <p className="text-sm text-muted-foreground">
          Choose a background image for the launcher
        </p>
      </div>

      {loadingImages ? (
        <p className="text-sm text-muted-foreground">Loading images...</p>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {images.map((image) => (
            <button
              key={image.id}
              onClick={() => selectBackground(image)}
              className={cn(
                "relative aspect-video rounded-xl overflow-hidden ring-2 transition-all hover:opacity-90",
                currentImageId === image.id
                  ? "ring-primary ring-offset-2 ring-offset-background"
                  : "ring-transparent"
              )}
            >
              <img
                src={`https://picsum.photos/id/${image.id}/200/150`}
                alt={`Photo by ${image.author}`}
                className="w-full h-full object-cover"
              />
              {currentImageId === image.id && (
                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                  <div className="size-6 bg-primary rounded-full flex items-center justify-center">
                    <svg
                      className="size-4 text-primary-foreground"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {currentBackground && (
        <Button onClick={resetBackground} variant="outline" className="w-fit">
          Reset to Default
        </Button>
      )}
    </div>
  );
}
