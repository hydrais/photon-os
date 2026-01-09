import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-secondlife-owner-key, x-secondlife-object-key, x-secondlife-object-name",
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

    // Parse request body
    const body = await req.json();
    const { type, payload } = body;

    if (!type) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing message type" }),
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

    // Find the device and verify it's registered
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

    // Get the device info
    const { data: device, error: deviceError } = await supabase
      .from("sl_registered_devices")
      .select("id")
      .eq("user_id", linkedAccount.user_id)
      .eq("object_key", objectKey)
      .single();

    if (deviceError || !device) {
      return new Response(
        JSON.stringify({ success: false, error: "Device not registered" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Broadcast message via Supabase Realtime
    const channelName = `sl-messages:${linkedAccount.user_id}`;
    console.log("[sl-device-message] Broadcasting to channel:", channelName);

    const channel = supabase.channel(channelName);

    const broadcastPayload = {
      device_id: device.id,
      object_key: objectKey,
      object_name: objectName || "Unknown",
      type,
      payload: payload || {},
      timestamp: new Date().toISOString(),
    };
    console.log("[sl-device-message] Payload:", JSON.stringify(broadcastPayload));

    // Subscribe to channel first (required for sending)
    const subscribePromise = new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("Subscribe timeout")), 5000);
      channel.subscribe((status) => {
        console.log("[sl-device-message] Subscribe status:", status);
        if (status === "SUBSCRIBED") {
          clearTimeout(timeout);
          resolve();
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          clearTimeout(timeout);
          reject(new Error(`Subscribe failed: ${status}`));
        }
      });
    });

    await subscribePromise;

    const sendResult = await channel.send({
      type: "broadcast",
      event: "device_message",
      payload: broadcastPayload,
    });
    console.log("[sl-device-message] Send result:", sendResult);

    // Unsubscribe from channel after sending
    await supabase.removeChannel(channel);

    // Also update last_heartbeat_at since the device is clearly online
    await supabase
      .from("sl_registered_devices")
      .update({ last_heartbeat_at: new Date().toISOString(), is_online: true })
      .eq("id", device.id);

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing device message:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
