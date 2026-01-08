import { supabase } from "./client";

type LinkingCodeRow = {
  id: string;
  user_id: string;
  code: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
};

export type LinkingCode = {
  code: string;
  expiresAt: string;
};

function generateSixDigitCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function createLinkingCode(userId: string): Promise<LinkingCode> {
  const code = generateSixDigitCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

  const { error } = await supabase.from("sl_linking_codes").insert({
    user_id: userId,
    code,
    expires_at: expiresAt,
  });

  if (error) {
    // If code collision (unlikely), retry once
    if (error.code === "23505") {
      const retryCode = generateSixDigitCode();
      const { error: retryError } = await supabase
        .from("sl_linking_codes")
        .insert({
          user_id: userId,
          code: retryCode,
          expires_at: expiresAt,
        });

      if (retryError) {
        console.error("Failed to create linking code:", retryError);
        throw retryError;
      }

      return { code: retryCode, expiresAt };
    }

    console.error("Failed to create linking code:", error);
    throw error;
  }

  return { code, expiresAt };
}

export async function getActiveLinkingCode(
  userId: string
): Promise<LinkingCode | null> {
  const { data, error } = await supabase
    .from("sl_linking_codes")
    .select("*")
    .eq("user_id", userId)
    .is("used_at", null)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No rows returned
      return null;
    }
    console.error("Failed to get active linking code:", error);
    throw error;
  }

  const row = data as LinkingCodeRow;
  return {
    code: row.code,
    expiresAt: row.expires_at,
  };
}
