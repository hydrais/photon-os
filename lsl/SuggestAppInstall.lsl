// ============================================
// SuggestAppInstall.lsl - Example Script
// ============================================
// This script demonstrates how to prompt the
// device owner to install an app on their
// Photon Tool.
//
// REQUIREMENTS:
// - PhotonDevice.lsl must be in the same object
// - Object owner must have their SL account linked
//   to their Photon OS account
//
// USAGE:
// Touch the object to suggest installing the app.

// Link message channels (must match PhotonDevice.lsl)
integer PHOTON_SEND = 90002;
integer PHOTON_STATUS = 90003;
integer PHOTON_REGISTERED = 90010;
integer PHOTON_OFFLINE = 90011;
integer PHOTON_ERROR = 90019;

// Track registration state
integer gRegistered = FALSE;

// App details - customize these for your app
string APP_BUNDLE_ID = "com.example.myapp";
string APP_NAME = "My Cool App";
string APP_AUTHOR = "Your Name";
string APP_URL = "https://example.com/myapp";

suggestAppInstall()
{
    if (!gRegistered)
    {
        llOwnerSay("Not connected to Photon yet. Please wait...");
        return;
    }

    string payload = llList2Json(JSON_OBJECT, [
        "bundleId", APP_BUNDLE_ID,
        "name", APP_NAME,
        "author", APP_AUTHOR,
        "url", APP_URL
    ]);

    llMessageLinked(LINK_SET, PHOTON_SEND, "photon:suggest_app_install", payload);
    llOwnerSay("Sent app install suggestion to your Photon Tool!");
}

default
{
    state_entry()
    {
        llOwnerSay("Touch me to suggest installing " + APP_NAME);
        // Request current status in case PhotonDevice already registered
        llMessageLinked(LINK_SET, PHOTON_STATUS, "", "");
    }

    touch_start(integer num)
    {
        if (llDetectedKey(0) == llGetOwner())
        {
            suggestAppInstall();
        }
    }

    link_message(integer sender, integer num, string str, key id)
    {
        if (num == PHOTON_REGISTERED)
        {
            gRegistered = TRUE;
            llOwnerSay("Connected to Photon! Touch me to suggest installing " + APP_NAME);
        }
        else if (num == PHOTON_OFFLINE)
        {
            gRegistered = FALSE;
        }
        else if (num == PHOTON_ERROR)
        {
            llOwnerSay("Photon error: " + (string)id);
        }
    }
}
