import { useEffect, useState } from "react";
import { useAuth } from "./lib/auth/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  fetchSharedPreference,
  setSharedPreference,
  deleteSharedPreference,
} from "./lib/supabase/preferences";

type PicsumImage = {
  id: string;
  author: string;
  width: number;
  height: number;
  url: string;
  download_url: string;
};

const BACKGROUND_PREF_KEY = "launcher_background_url";

export function Settings() {
  const { user, signOut } = useAuth();
  const [images, setImages] = useState<PicsumImage[]>([]);
  const [currentBackground, setCurrentBackground] = useState<string | null>(
    null
  );
  const [loadingImages, setLoadingImages] = useState(true);

  const displayName =
    user?.user_metadata?.display_name ||
    user?.email?.split("@")[0] ||
    "User";

  // Fetch available images and current preference
  useEffect(() => {
    async function load() {
      try {
        // Fetch images from picsum
        const response = await fetch(
          "https://picsum.photos/v2/list?page=1&limit=12"
        );
        const data = await response.json();
        setImages(data);

        // Fetch current preference
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

  // Extract image ID from current background URL for highlighting
  const currentImageId = currentBackground?.match(/\/id\/(\d+)\//)?.[1] ?? null;

  return (
    <div className="h-full bg-background p-4 overflow-auto">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>

      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Manage your account settings</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Signed in as</p>
              <p className="font-medium">{displayName}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
            <Button onClick={signOut} variant="destructive" className="w-fit">
              Sign Out
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize the launcher background</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-3">
                Launcher Background
              </p>
              {loadingImages ? (
                <p className="text-sm text-muted-foreground">
                  Loading images...
                </p>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {images.map((image) => (
                    <button
                      key={image.id}
                      onClick={() => selectBackground(image)}
                      className={`relative aspect-video rounded-md overflow-hidden border-2 transition-all hover:opacity-90 ${
                        currentImageId === image.id
                          ? "border-primary ring-2 ring-primary ring-offset-2"
                          : "border-transparent"
                      }`}
                    >
                      <img
                        src={`https://picsum.photos/id/${image.id}/200/150`}
                        alt={`Photo by ${image.author}`}
                        className="w-full h-full object-cover"
                      />
                      {currentImageId === image.id && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-primary-foreground"
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
            </div>
            {currentBackground && (
              <Button
                onClick={resetBackground}
                variant="outline"
                className="w-fit"
              >
                Reset to Default
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
