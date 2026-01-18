import { useNavigate } from "react-router";
import {
  History,
  RefreshCw,
  LayoutDashboard,
  User,
  Shirt,
  Wrench,
  Gamepad2,
  Users,
  Play,
  GraduationCap,
} from "lucide-react";
import { useDeveloperProfile } from "@/hooks/useDeveloperProfile";
import { PhotonNavBar } from "@/components/ui/photon/nav-bar";
import { PhotonNavBarTitle } from "@/components/ui/photon/nav-bar-title";
import { PhotonSectionHeader } from "@/components/ui/photon/section-header";
import { PhotonContentArea } from "@/components/ui/photon/content-area";
import { PhotonSectionList } from "@/components/ui/photon/section-list";
import { PhotonSectionItem } from "@/components/ui/photon/section-item";
import type { AppCategory } from "@/lib/supabase/client";
import type { LucideIcon } from "lucide-react";

const categories: { slug: AppCategory; name: string; icon: LucideIcon }[] = [
  { slug: "avatar", name: "Avatar", icon: Shirt },
  { slug: "tools", name: "Tools", icon: Wrench },
  { slug: "games", name: "Games", icon: Gamepad2 },
  { slug: "social", name: "Social", icon: Users },
  { slug: "media", name: "Media", icon: Play },
  { slug: "education", name: "Education", icon: GraduationCap },
];

export function MoreScreen() {
  const { hasProfile, loading } = useDeveloperProfile();
  const navigate = useNavigate();

  return (
    <>
      <PhotonNavBar>
        <PhotonNavBarTitle>More</PhotonNavBarTitle>
      </PhotonNavBar>

      <PhotonContentArea>
        {/* Categories Section */}
        <section>
          <PhotonSectionHeader>Categories</PhotonSectionHeader>

          <PhotonSectionList>
            {categories.map((cat) => (
              <PhotonSectionItem
                key={cat.slug}
                icon={cat.icon}
                label={cat.name}
                onClick={() => navigate(`/more/category/${cat.slug}`)}
              />
            ))}
          </PhotonSectionList>
        </section>

        {/* Your Apps Section */}
        <section>
          <PhotonSectionHeader>Your Apps</PhotonSectionHeader>

          <PhotonSectionList>
            <PhotonSectionItem
              icon={History}
              label="Install History"
              onClick={() => navigate("/more/history")}
            />
            <PhotonSectionItem
              icon={RefreshCw}
              label="Recent Updates"
              onClick={() => navigate("/more/updates")}
            />
          </PhotonSectionList>
        </section>

        {/* Developer Section */}
        <section>
          {hasProfile ? (
            <>
              <PhotonSectionHeader>Developer</PhotonSectionHeader>

              <PhotonSectionList>
                <PhotonSectionItem
                  icon={LayoutDashboard}
                  label="Published Apps"
                  onClick={() => navigate("/more/store/dashboard")}
                />

                <PhotonSectionItem
                  icon={User}
                  label="Store Profile"
                  onClick={() => navigate("/more/store/edit")}
                />
              </PhotonSectionList>
            </>
          ) : !loading ? (
            <>
              <PhotonSectionHeader>Developer</PhotonSectionHeader>
              <PhotonSectionList>
                <PhotonSectionItem
                  label="Publish your own app"
                  onClick={() => navigate("/more/store/setup")}
                />
              </PhotonSectionList>
            </>
          ) : null}
        </section>
      </PhotonContentArea>
    </>
  );
}
