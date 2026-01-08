import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
    // Get authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse request body
    const body = await req.json();
    const { device_id, type, payload } = body;

    if (!device_id) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing device_id" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create Supabase client with user's auth
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // First verify the user
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid authorization" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Use service role client for database operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the device and verify ownership
    const { data: device, error: deviceError } = await supabase
      .from("sl_registered_devices")
      .select("id, callback_url, object_name, is_online")
      .eq("id", device_id)
      .eq("user_id", user.id)
      .single();

    if (deviceError || !device) {
      return new Response(
        JSON.stringify({ success: false, error: "Device not found or not owned by user" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Send HTTP request to the device's callback URL
    try {
      console.log("Sending to device:", { callback_url: device.callback_url, type, payload });

      const response = await fetch(device.callback_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: type || "message",
          payload: payload || {},
        }),
      });

      const responseText = await response.text();
      console.log("Device response:", { status: response.status, body: responseText });

      if (!response.ok) {
        // Mark device as offline if we can't reach it
        await supabase
          .from("sl_registered_devices")
          .update({ is_online: false })
          .eq("id", device_id);

        return new Response(
          JSON.stringify({
            success: false,
            error: `Failed to reach device: HTTP ${response.status}`,
            device_offline: true,
          }),
          {
            status: 502,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: `Message sent to "${device.object_name}"`,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (fetchError) {
      console.error("Fetch error:", fetchError);

      // Mark device as offline if we can't reach it
      await supabase
        .from("sl_registered_devices")
        .update({ is_online: false })
        .eq("id", device_id);

      return new Response(
        JSON.stringify({
          success: false,
          error: `Failed to reach device: ${fetchError instanceof Error ? fetchError.message : "Unknown error"}`,
          device_offline: true,
        }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Error sending to device:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
