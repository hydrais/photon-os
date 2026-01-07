import { supabase } from "./client";
import type { SecondLifeAccount } from "@photon-os/sdk";

type UserLinkedSlAccountRow = {
  id: string;
  user_id: string;
  avatar_uuid: string;
  avatar_name: string;
  linked_at: string;
};

function rowToSecondLifeAccount(row: UserLinkedSlAccountRow): SecondLifeAccount {
  return {
    avatarUuid: row.avatar_uuid,
    avatarName: row.avatar_name,
    linkedAt: row.linked_at,
  };
}

export async function fetchLinkedSecondLifeAccounts(
  userId: string
): Promise<SecondLifeAccount[]> {
  const { data, error } = await supabase
    .from("user_linked_sl_accounts")
    .select("*")
    .eq("user_id", userId)
    .order("linked_at", { ascending: true });

  if (error) {
    console.error("Failed to fetch linked SL accounts:", error);
    throw error;
  }

  return (data ?? []).map(rowToSecondLifeAccount);
}

export async function deleteLinkedSecondLifeAccount(
  userId: string,
  avatarUuid: string
): Promise<void> {
  const { error } = await supabase
    .from("user_linked_sl_accounts")
    .delete()
    .eq("user_id", userId)
    .eq("avatar_uuid", avatarUuid);

  if (error) {
    console.error("Failed to unlink SL account:", error);
    throw error;
  }
}
