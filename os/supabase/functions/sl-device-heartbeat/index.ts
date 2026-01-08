import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-secondlife-owner-key, x-secondlife-object-key",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ success: false, error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Extract Second Life headers
    const ownerKey = req.headers.get("x-secondlife-owner-key");
    const objectKey = req.headers.get("x-secondlife-object-key");

    if (!ownerKey || !objectKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing Second Life headers",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse request body (callback_url may have changed)
    const body = await req.json();
    const { callback_url } = body;

    // Create Supabase client with service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find the linked SL account
    const { data: linkedAccount, error: accountError } = await supabase
      .from("user_linked_sl_accounts")
      .select("user_id")
      .eq("avatar_uuid", ownerKey)
      .single();

    if (accountError || !linkedAccount) {
      return new Response(
        JSON.stringify({ success: false, error: "Account not linked" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Update the device heartbeat
    const updateData: Record<string, unknown> = {
      last_heartbeat_at: new Date().toISOString(),
      is_online: true,
    };

    if (callback_url) {
      updateData.callback_url = callback_url;
    }

    const { error: updateError } = await supabase
      .from("sl_registered_devices")
      .update(updateData)
      .eq("user_id", linkedAccount.user_id)
      .eq("object_key", objectKey);

    if (updateError) {
      console.error("Error updating heartbeat:", updateError);
      throw updateError;
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing heartbeat:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
