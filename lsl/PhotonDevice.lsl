// ============================================
// PhotonDevice.lsl - Photon OS Device Library
// ============================================
// Drop this script into any object to enable
// Photon connectivity. The script auto-registers
// on startup. Other scripts in the object
// communicate via link messages.
//
// REQUIREMENTS:
// - Object owner must have their SL account linked
//   to their Photon OS account first
//
// USAGE:
// The script registers automatically on startup.
// Send link messages to this script:
//   llMessageLinked(LINK_SET, PHOTON_SEND, "message_type", "json_payload");
//
// Receive link messages from this script:
//   PHOTON_REGISTERED - Registration confirmed (key = device_id)
//   PHOTON_OFFLINE - Connection lost
//   PHOTON_RECEIVE - Message received (str = type, key = payload JSON)
//   PHOTON_ERROR - Error occurred (key = error message)

// ===================
// Link Message Channels
// ===================
// Inbound (to PhotonDevice)
integer PHOTON_REGISTER = 90001;   // Request registration
integer PHOTON_SEND = 90002;       // Send message to Photon

// Outbound (from PhotonDevice)
integer PHOTON_REGISTERED = 90010; // Registration confirmed (key = device_id)
integer PHOTON_OFFLINE = 90011;    // Connection lost
integer PHOTON_RECEIVE = 90012;    // Message received (str = type, key = payload JSON)
integer PHOTON_ERROR = 90019;      // Error occurred (key = error message)

// ===================
// Configuration
// ===================
string SUPABASE_URL = "https://rujeueevbvywlfrcjeya.supabase.co/functions/v1";
integer HEARTBEAT_INTERVAL = 300;  // 5 minutes

// ===================
// State Variables
// ===================
string gCallbackUrl = "";
string gDeviceId = "";
integer gRegistered = FALSE;

// Request tracking
key gRegisterRequest = NULL_KEY;
key gHeartbeatRequest = NULL_KEY;
key gMessageRequest = NULL_KEY;

// ===================
// Helper Functions
// ===================
broadcast(integer channel, string str, key id)
{
    llMessageLinked(LINK_SET, channel, str, id);
}

requestRegistration()
{
    if (gCallbackUrl == "")
    {
        // Request URL first - registration will happen when we get it
        llRequestURL();
        return;
    }

    string body = llList2Json(JSON_OBJECT, [
        "callback_url", (string)gCallbackUrl
    ]);

    gRegisterRequest = llHTTPRequest(
        SUPABASE_URL + "/register-sl-device",
        [HTTP_METHOD, "POST", HTTP_MIMETYPE, "application/json"],
        body
    );
}

sendHeartbeat()
{
    if (gCallbackUrl == "") return;

    string body = llList2Json(JSON_OBJECT, [
        "callback_url", (string)gCallbackUrl
    ]);

    gHeartbeatRequest = llHTTPRequest(
        SUPABASE_URL + "/sl-device-heartbeat",
        [HTTP_METHOD, "POST", HTTP_MIMETYPE, "application/json"],
        body
    );
}

sendMessageToPhoton(string msgType, string payload)
{
    if (!gRegistered)
    {
        broadcast(PHOTON_ERROR, "error", "Not registered");
        return;
    }

    string body = llList2Json(JSON_OBJECT, [
        "type", msgType,
        "payload", payload
    ]);

    gMessageRequest = llHTTPRequest(
        SUPABASE_URL + "/sl-device-message",
        [HTTP_METHOD, "POST", HTTP_MIMETYPE, "application/json"],
        body
    );
}

markOffline()
{
    gRegistered = FALSE;
    gDeviceId = "";
    llSetTimerEvent(0.0);
    broadcast(PHOTON_OFFLINE, "offline", "");
}

// ===================
// Main State
// ===================
default
{
    state_entry()
    {
        // Request a URL for incoming HTTP requests
        llRequestURL();
    }

    on_rez(integer param)
    {
        // Reset state when rezzed - will auto-register when URL is granted
        gCallbackUrl = "";
        gRegistered = FALSE;
        gDeviceId = "";
        llSetTimerEvent(0.0);
        broadcast(PHOTON_OFFLINE, "offline", "");
        llRequestURL();
    }

    changed(integer change)
    {
        if (change & CHANGED_REGION)
        {
            // URL is invalid after region change
            gCallbackUrl = "";
            markOffline();
            llRequestURL();
        }
        if (change & CHANGED_OWNER)
        {
            // New owner needs to re-register
            llResetScript();
        }
    }

    // ===================
    // URL Events
    // ===================
    http_request(key id, string method, string body)
    {
        if (method == URL_REQUEST_GRANTED)
        {
            // The actual URL is in the body parameter, id is just a handle
            gCallbackUrl = body;

            // Auto-register when we get a URL
            requestRegistration();
            return;
        }

        if (method == URL_REQUEST_DENIED)
        {
            llOwnerSay("[Photon] ERROR: URL request denied - no available URLs");
            broadcast(PHOTON_ERROR, "error", "URL request denied - no available URLs");
            return;
        }

        // Incoming HTTP request from Photon
        if (method == "POST")
        {
            // Parse the message
            string msgType = llJsonGetValue(body, ["type"]);
            string payload = llJsonGetValue(body, ["payload"]);

            if (msgType == JSON_INVALID)
            {
                llHTTPResponse(id, 400, "Invalid request");
                return;
            }

            // Broadcast to other scripts
            broadcast(PHOTON_RECEIVE, msgType, payload);

            llHTTPResponse(id, 200, "OK");
            return;
        }

        // Unknown request
        llHTTPResponse(id, 405, "Method not allowed");
    }

    // ===================
    // HTTP Responses
    // ===================
    http_response(key id, integer status, list metadata, string body)
    {
        // Registration response
        if (id == gRegisterRequest)
        {
            gRegisterRequest = NULL_KEY;

            if (status == 200)
            {
                string success = llJsonGetValue(body, ["success"]);
                if (success == JSON_TRUE)
                {
                    gDeviceId = llJsonGetValue(body, ["device_id"]);
                    gRegistered = TRUE;
                    llSetTimerEvent(HEARTBEAT_INTERVAL);
                    broadcast(PHOTON_REGISTERED, "registered", gDeviceId);
                    return;
                }
            }

            // Registration failed
            string error = llJsonGetValue(body, ["error"]);
            if (error == JSON_INVALID) error = "Unknown error";
            llOwnerSay("[Photon] ERROR: Registration failed (HTTP " + (string)status + "): " + error);
            broadcast(PHOTON_ERROR, "register_failed", error);
            return;
        }

        // Heartbeat response
        if (id == gHeartbeatRequest)
        {
            gHeartbeatRequest = NULL_KEY;

            if (status != 200)
            {
                // Heartbeat failed - might need to re-register
                string error = llJsonGetValue(body, ["error"]);
                if (error == JSON_INVALID) error = "Unknown error";
                llOwnerSay("[Photon] WARNING: Heartbeat failed (HTTP " + (string)status + "): " + error);
                broadcast(PHOTON_ERROR, "heartbeat_failed", error);
                // Don't mark offline yet - could be temporary
            }
            return;
        }

        // Message send response
        if (id == gMessageRequest)
        {
            gMessageRequest = NULL_KEY;

            if (status != 200)
            {
                string error = llJsonGetValue(body, ["error"]);
                if (error == JSON_INVALID) error = "Unknown error";
                llOwnerSay("[Photon] ERROR: Send message failed (HTTP " + (string)status + "): " + error);
                broadcast(PHOTON_ERROR, "send_failed", error);
            }
            return;
        }
    }

    // ===================
    // Link Messages (from other scripts)
    // ===================
    link_message(integer sender, integer num, string str, key id)
    {
        if (num == PHOTON_REGISTER)
        {
            requestRegistration();
            return;
        }

        if (num == PHOTON_SEND)
        {
            sendMessageToPhoton(str, (string)id);
            return;
        }
    }

    // ===================
    // Heartbeat Timer
    // ===================
    timer()
    {
        sendHeartbeat();
    }
}
