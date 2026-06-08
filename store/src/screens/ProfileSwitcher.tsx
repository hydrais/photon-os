import { useNavigate } from "react-router";
import { Check, UserPlus } from "lucide-react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useDeveloperProfile } from "@/hooks/useDeveloperProfile";
import { PhotonNavBar } from "@/components/ui/photon/nav-bar";
import { PhotonNavBarBackButton } from "@/components/ui/photon/nav-bar-back-button";
import { PhotonNavBarTitle } from "@/components/ui/photon/nav-bar-title";
import { PhotonSectionHeader } from "@/components/ui/photon/section-header";
import { PhotonContentArea } from "@/components/ui/photon/content-area";
import { PhotonSectionList } from "@/components/ui/photon/section-list";
import { PhotonSectionItem } from "@/components/ui/photon/section-item";

function ProfileSwitcherContent() {
  const navigate = useNavigate();
  const { profiles, activeProfile, setActiveProfile } = useDeveloperProfile();

  const handleSelect = (profileId: string) => {
    setActiveProfile(profileId);
    navigate("/more");
  };

  return (
    <>
      <PhotonNavBar>
        <PhotonNavBarBackButton onClick={() => navigate("/more")} />
        <PhotonNavBarTitle>Switch Profile</PhotonNavBarTitle>
      </PhotonNavBar>

      <PhotonContentArea>
        <section>
          <PhotonSectionHeader>Your Developer Profiles</PhotonSectionHeader>

          <PhotonSectionList>
            {profiles.map((profile) => {
              const isActive = profile.id === activeProfile?.id;
              return (
                <button
                  key={profile.id}
                  onClick={() => handleSelect(profile.id)}
                  className="flex flex-row items-center gap-3 py-3 hover:bg-muted/50 px-4 transition-colors w-full text-left first:rounded-tl-md first:rounded-tr-md last:rounded-bl-md last:rounded-br-md"
                >
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-medium text-foreground truncate">
                      {profile.display_name}
                    </span>
                    {profile.description && (
                      <span className="block text-xs text-muted-foreground truncate">
                        {profile.description}
                      </span>
                    )}
                  </span>
                  {isActive && (
                    <Check className="size-4 text-primary shrink-0" />
                  )}
                </button>
              );
            })}
          </PhotonSectionList>
        </section>

        <section>
          <PhotonSectionList>
            <PhotonSectionItem
              icon={UserPlus}
              label="Add developer profile"
              onClick={() => navigate("/more/store/setup")}
            />
          </PhotonSectionList>
        </section>
      </PhotonContentArea>
    </>
  );
}

export function ProfileSwitcherScreen() {
  return (
    <AuthGuard requireProfile>
      <ProfileSwitcherContent />
    </AuthGuard>
  );
}
