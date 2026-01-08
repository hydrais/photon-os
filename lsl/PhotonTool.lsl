// Photon Tool - Second Life Account Linker
// Links your Second Life account to your Photon OS account
// Usage: /10 link

string SUPABASE_FUNCTION_URL = "https://rujeueevbvywlfrcjeya.supabase.co/functions/v1/link-sl-account";

integer COMMAND_CHANNEL = 10;

integer gCommandListenHandle;
integer gCodeListenHandle;
integer gCodeChannel;
key gHttpRequestId;

default
{
    state_entry()
    {
        // Listen for commands from owner on channel 10
        gCommandListenHandle = llListen(COMMAND_CHANNEL, "", llGetOwner(), "");
    }

    on_rez(integer start_param)
    {
        // Re-initialize when rezzed or attached
        llResetScript();
    }

    changed(integer change)
    {
        // Re-initialize if owner changes
        if (change & CHANGED_OWNER)
        {
            llResetScript();
        }
    }

    listen(integer channel, string name, key id, string message)
    {
        message = llToLower(llStringTrim(message, STRING_TRIM));

        // Handle command channel
        if (channel == COMMAND_CHANNEL)
        {
            if (message == "link")
            {
                // Generate a random channel for the code input dialog
                gCodeChannel = -1 - (integer)llFrand(1000000);

                // Set up listener for code input
                gCodeListenHandle = llListen(gCodeChannel, "", id, "");

                // Set a timeout to clean up the listener
                llSetTimerEvent(120.0); // 2 minute timeout

                // Show the text input dialog
                llTextBox(id,
                    "Enter your 6-digit Photon linking code.\n\n" +
                    "You can get this code from Settings > Account\n" +
                    "in your Photon OS.",
                    gCodeChannel);
            }
            return;
        }

        // Handle code input channel
        if (channel == gCodeChannel)
        {
            // Clean up code listener
            llListenRemove(gCodeListenHandle);
            llSetTimerEvent(0.0);

            // Validate the code format (6 digits)
            message = llStringTrim(message, STRING_TRIM);

            if (llStringLength(message) != 6)
            {
                llRegionSayTo(id, 0, "Invalid code. Please enter a 6-digit code.");
                return;
            }

            // Check if it's all digits
            integer i;
            for (i = 0; i < 6; i++)
            {
                string char = llGetSubString(message, i, i);
                if (char < "0" || char > "9")
                {
                    llRegionSayTo(id, 0, "Invalid code. Please enter a 6-digit numeric code.");
                    return;
                }
            }

            llRegionSayTo(id, 0, "Linking your account, please wait...");

            // Send HTTP request to Supabase function
            // The X-SecondLife-* headers are automatically attached by SL
            gHttpRequestId = llHTTPRequest(SUPABASE_FUNCTION_URL, [
                HTTP_METHOD, "POST",
                HTTP_MIMETYPE, "application/json"
            ], "{\"code\":\"" + message + "\"}");
        }
    }

    http_response(key request_id, integer status, list metadata, string body)
    {
        if (request_id != gHttpRequestId) return;

        key owner = llGetOwner();

        if (status == 200)
        {
            // Parse success response
            // Response format: {"success":true,"avatarName":"...","message":"..."}
            if (llSubStringIndex(body, "\"success\":true") != -1)
            {
                // Extract avatar name from response
                integer nameStart = llSubStringIndex(body, "\"avatarName\":\"") + 14;
                integer nameEnd = llSubStringIndex(llGetSubString(body, nameStart, -1), "\"") + nameStart - 1;
                string avatarName = llGetSubString(body, nameStart, nameEnd);

                llRegionSayTo(owner, 0, "Success! Your account (" + avatarName + ") has been linked to Photon OS.");
                llRegionSayTo(owner, 0, "You can now close the linking dialog in your browser.");
            }
            else
            {
                // Parse error from response
                integer errorStart = llSubStringIndex(body, "\"error\":\"") + 9;
                integer errorEnd = llSubStringIndex(llGetSubString(body, errorStart, -1), "\"") + errorStart - 1;
                string error = llGetSubString(body, errorStart, errorEnd);

                llRegionSayTo(owner, 0, "Linking failed: " + error);
            }
        }
        else if (status == 400)
        {
            // Parse error from response
            integer errorStart = llSubStringIndex(body, "\"error\":\"") + 9;
            integer errorEnd = llSubStringIndex(llGetSubString(body, errorStart, -1), "\"") + errorStart - 1;
            string error = llGetSubString(body, errorStart, errorEnd);

            llRegionSayTo(owner, 0, "Linking failed: " + error);
        }
        else
        {
            llRegionSayTo(owner, 0, "Error contacting Photon server (status " + (string)status + "). Please try again later.");
        }
    }

    timer()
    {
        // Clean up code listener on timeout
        llListenRemove(gCodeListenHandle);
        llSetTimerEvent(0.0);
        llRegionSayTo(llGetOwner(), 0, "Linking dialog timed out. Say /10 link to try again.");
    }
}
