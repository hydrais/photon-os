import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Check } from "lucide-react";
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
import { createLinkingCode } from "@/lib/supabase/linkingCodes";
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

  // Linking code state
  const [linkingCode, setLinkingCode] = useState<string | null>(null);
  const [codeExpiresAt, setCodeExpiresAt] = useState<string | null>(null);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [linkSuccess, setLinkSuccess] = useState<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const initialAccountCountRef = useRef<number>(0);

  const displayName =
    user?.user_metadata?.display_name || user?.email?.split("@")[0] || "User";

  const loadAccounts = useCallback(async () => {
    if (!user) return [];
    try {
      const accounts = await fetchLinkedSecondLifeAccounts(user.id);
      return accounts;
    } catch (error) {
      console.error("Failed to load linked accounts:", error);
      return [];
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    async function initialLoad() {
      const accounts = await loadAccounts();
      if (!cancelled) {
        setLinkedAccounts(accounts);
        setIsLoading(false);
      }
    }

    initialLoad();

    return () => {
      cancelled = true;
    };
  }, [user, loadAccounts]);

  // Generate linking code when drawer opens
  const handleOpenLinkDrawer = async () => {
    setShowLinkDrawer(true);
    setLinkSuccess(null);
    setIsGeneratingCode(true);
    initialAccountCountRef.current = linkedAccounts.length;

    try {
      if (!user) return;
      const { code, expiresAt } = await createLinkingCode(user.id);
      setLinkingCode(code);
      setCodeExpiresAt(expiresAt);
    } catch (error) {
      console.error("Failed to generate linking code:", error);
    } finally {
      setIsGeneratingCode(false);
    }
  };

  // Start polling when we have a code
  useEffect(() => {
    if (!showLinkDrawer || !linkingCode || linkSuccess) {
      return;
    }

    // Poll every 3 seconds for new accounts
    pollingRef.current = setInterval(async () => {
      const accounts = await loadAccounts();
      if (accounts.length > initialAccountCountRef.current) {
        // Find the new account
        const newAccount = accounts.find(
          (acc) => !linkedAccounts.some((la) => la.avatarUuid === acc.avatarUuid)
        );
        if (newAccount) {
          setLinkSuccess(newAccount.avatarName);
          setLinkedAccounts(accounts);
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
        }
      }
    }, 3000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [showLinkDrawer, linkingCode, linkSuccess, loadAccounts, linkedAccounts]);

  // Clean up when drawer closes
  const handleCloseLinkDrawer = () => {
    setShowLinkDrawer(false);
    setLinkingCode(null);
    setCodeExpiresAt(null);
    setLinkSuccess(null);
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

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

  // Calculate time remaining for code
  const getTimeRemaining = () => {
    if (!codeExpiresAt) return "";
    const remaining = new Date(codeExpiresAt).getTime() - Date.now();
    if (remaining <= 0) return "Expired";
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
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

      <Button variant="secondary" onClick={handleOpenLinkDrawer}>
        <Plus /> Link a Second Life Account
      </Button>

      <Drawer open={showLinkDrawer} onOpenChange={(open) => !open && handleCloseLinkDrawer()} dismissible={false}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>
              {linkSuccess ? "Account Linked!" : "Link a Second Life Account"}
            </DrawerTitle>
            <DrawerDescription>
              {linkSuccess
                ? `Successfully linked ${linkSuccess} to your Photon account.`
                : "Enter this code in your Photon Tool in Second Life."}
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4 flex flex-col gap-4">
            {linkSuccess ? (
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Check className="w-8 h-8 text-green-500" />
                </div>
                <p className="text-center text-muted-foreground">
                  Your Second Life account is now linked. Items owned by{" "}
                  {linkSuccess} can now communicate with your Photon Tool.
                </p>
              </div>
            ) : isGeneratingCode ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin" />
              </div>
            ) : linkingCode ? (
              <>
                <div className="flex flex-col items-center gap-2 py-4">
                  <p className="text-sm text-muted-foreground">Your linking code:</p>
                  <div className="text-4xl font-mono font-bold tracking-widest">
                    {linkingCode}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Expires in {getTimeRemaining()}
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                      1
                    </div>
                    <p className="text-sm">
                      Attach your Photon Tool in Second Life (if not already attached).
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                      2
                    </div>
                    <p className="text-sm">
                      Say "/10 link" in Second Life to start the linking process.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                      3
                    </div>
                    <p className="text-sm">
                      When prompted, enter the code above.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                      4
                    </div>
                    <p className="text-sm">
                      Wait for confirmation. This page will update automatically.
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="animate-spin w-4 h-4" />
                  Waiting for link...
                </div>
              </>
            ) : null}
          </div>
          <DrawerFooter>
            <Button variant="outline" onClick={handleCloseLinkDrawer}>
              {linkSuccess ? "Done" : "Cancel"}
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
