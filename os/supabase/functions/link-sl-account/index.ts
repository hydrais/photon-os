import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-secondlife-owner-key, x-secondlife-owner-name",
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
    const ownerName = req.headers.get("x-secondlife-owner-name");

    if (!ownerKey || !ownerName) {
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
    const { code } = body;

    if (!code) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing linking code" }),
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

    // Find the linking code
    const { data: linkingCode, error: codeError } = await supabase
      .from("sl_linking_codes")
      .select("*")
      .eq("code", code)
      .is("used_at", null)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (codeError || !linkingCode) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid or expired linking code" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Insert the linked account
    const { error: insertError } = await supabase
      .from("user_linked_sl_accounts")
      .insert({
        user_id: linkingCode.user_id,
        avatar_uuid: ownerKey,
        avatar_name: ownerName,
      });

    if (insertError) {
      // Check for duplicate
      if (insertError.code === "23505") {
        return new Response(
          JSON.stringify({
            success: false,
            error: "This Second Life account is already linked to your Photon account",
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      throw insertError;
    }

    // Mark the code as used
    await supabase
      .from("sl_linking_codes")
      .update({ used_at: new Date().toISOString() })
      .eq("id", linkingCode.id);

    return new Response(
      JSON.stringify({
        success: true,
        avatarName: ownerName,
        message: `Successfully linked ${ownerName} to your Photon account`,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error linking account:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
