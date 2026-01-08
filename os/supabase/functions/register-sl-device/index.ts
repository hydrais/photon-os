import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-secondlife-owner-key, x-secondlife-owner-name, x-secondlife-object-key, x-secondlife-object-name, x-secondlife-region",
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
    const objectName = req.headers.get("x-secondlife-object-name");
    const regionName = req.headers.get("x-secondlife-region");

    if (!ownerKey || !objectKey || !objectName) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing Second Life headers. This endpoint must be called from within Second Life.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse request body
    const body = await req.json();
    const { callback_url } = body;

    if (!callback_url) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing callback_url in request body" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create Supabase client with service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find the linked SL account by owner key
    const { data: linkedAccounts, error: accountError } = await supabase
      .from("user_linked_sl_accounts")
      .select("id, user_id")
      .eq("avatar_uuid", ownerKey)
      .limit(1);

    const linkedAccount = linkedAccounts?.[0];

    if (accountError || !linkedAccount) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Second Life account not linked to any Photon account. Please link your account first.",
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Upsert the device registration
    const { data: device, error: upsertError } = await supabase
      .from("sl_registered_devices")
      .upsert(
        {
          user_id: linkedAccount.user_id,
          sl_account_id: linkedAccount.id,
          object_key: objectKey,
          object_name: objectName,
          callback_url: callback_url,
          region_name: regionName,
          last_heartbeat_at: new Date().toISOString(),
          is_online: true,
        },
        {
          onConflict: "user_id,object_key",
        }
      )
      .select("id")
      .single();

    if (upsertError) {
      console.error("Error registering device:", upsertError);
      throw upsertError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        device_id: device.id,
        message: `Device "${objectName}" registered successfully`,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error registering device:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
