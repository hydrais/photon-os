import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  fetchLinkedSecondLifeAccounts,
  deleteLinkedSecondLifeAccount,
} from "@/lib/supabase/linkedSecondLifeAccounts";
import type { SecondLifeAccount as SecondLifeAccountType } from "@photon-os/sdk";

function SecondLifeAccountItem({
  account,
  onUnlink,
  isUnlinking,
}: {
  account: SecondLifeAccountType;
  onUnlink: () => void;
  isUnlinking: boolean;
}) {
  return (
    <div className="p-4 flex items-center gap-4">
      <div>
        <p className="font-medium text-lg">{account.avatarName}</p>
        <p className="text-xs text-muted-foreground font-mono">
          {account.avatarUuid}
        </p>
      </div>
      <Button
        variant="destructive"
        className="ml-auto"
        onClick={onUnlink}
        disabled={isUnlinking}
      >
        {isUnlinking ? <Loader2 className="animate-spin" /> : "Unlink"}
      </Button>
    </div>
  );
}

export function AccountSection() {
  const { user, signOut } = useAuth();
  const [linkedAccounts, setLinkedAccounts] = useState<SecondLifeAccountType[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [unlinkingId, setUnlinkingId] = useState<string | null>(null);
  const [showLinkDrawer, setShowLinkDrawer] = useState(false);
  const [accountToUnlink, setAccountToUnlink] =
    useState<SecondLifeAccountType | null>(null);

  const displayName =
    user?.user_metadata?.display_name || user?.email?.split("@")[0] || "User";

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    async function loadAccounts() {
      try {
        const accounts = await fetchLinkedSecondLifeAccounts(user!.id);
        if (!cancelled) {
          setLinkedAccounts(accounts);
        }
      } catch (error) {
        console.error("Failed to load linked accounts:", error);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadAccounts();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleUnlink = async () => {
    if (!user || !accountToUnlink) return;

    const avatarUuid = accountToUnlink.avatarUuid;
    setAccountToUnlink(null);
    setUnlinkingId(avatarUuid);

    try {
      await deleteLinkedSecondLifeAccount(user.id, avatarUuid);
      setLinkedAccounts((prev) =>
        prev.filter((acc) => acc.avatarUuid !== avatarUuid)
      );
    } catch (error) {
      console.error("Failed to unlink account:", error);
    } finally {
      setUnlinkingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-4 max-w-xl mx-auto">
      <div>
        <h2 className="text-lg font-semibold">Photon Account</h2>
      </div>

      <div className="rounded-2xl bg-card ring-1 ring-foreground/10 p-4 flex items-center gap-4">
        <div>
          <p className="font-medium text-lg">@{displayName}</p>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
        <Button onClick={signOut} variant="destructive" className="ml-auto">
          Sign Out
        </Button>
      </div>

      <div>
        <h2 className="text-lg font-semibold">Second Life Accounts</h2>
        <p className="text-sm text-muted-foreground">
          Linking a Second Life account enables items you own in Second Life to
          communicate with your Photon Tool.
        </p>
      </div>

      <div className="rounded-2xl bg-card ring-1 ring-foreground/10 divide-y">
        {isLoading ? (
          <div className="p-4 flex items-center justify-center">
            <Loader2 className="animate-spin" />
          </div>
        ) : linkedAccounts.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No Second Life accounts linked yet.
          </div>
        ) : (
          linkedAccounts.map((account) => (
            <SecondLifeAccountItem
              key={account.avatarUuid}
              account={account}
              onUnlink={() => setAccountToUnlink(account)}
              isUnlinking={unlinkingId === account.avatarUuid}
            />
          ))
        )}
      </div>

      <Button variant="secondary" onClick={() => setShowLinkDrawer(true)}>
        <Plus /> Link a Second Life Account
      </Button>

      <Drawer open={showLinkDrawer} onOpenChange={setShowLinkDrawer}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Link a Second Life Account</DrawerTitle>
            <DrawerDescription>
              To link your Second Life account, you'll need the Photon Tool
              in-world.
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4 flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <p className="text-sm">
                  Get the Photon Tool from the Second Life Marketplace.
                </p>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <p className="text-sm">
                  Rez the Photon Tool in-world and touch it to begin the linking
                  process.
                </p>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <p className="text-sm">
                  Follow the instructions provided by the tool to complete the
                  link.
                </p>
              </div>
            </div>
          </div>
          <DrawerFooter>
            <Button variant="outline" onClick={() => setShowLinkDrawer(false)}>
              Close
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Drawer
        open={Boolean(accountToUnlink)}
        onClose={() => setAccountToUnlink(null)}
      >
        <DrawerContent>
          <div className="mx-auto w-full max-w-sm">
            <DrawerHeader>
              <DrawerTitle>Unlink {accountToUnlink?.avatarName}?</DrawerTitle>
              <DrawerDescription>
                Items owned by this Second Life account will no longer be able
                to communicate with your Photon Tool.
              </DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <Button onClick={handleUnlink} variant="destructive" size="lg">
                Unlink Account
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setAccountToUnlink(null)}
              >
                Cancel
              </Button>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
