// ============================================
// PhotonChat.lsl - Chat Output for Photon
// ============================================
// Add this script alongside PhotonDevice.lsl
// to output received "chat" messages to local chat
// and echo them back to the sender.

// PhotonDevice link message channels
integer PHOTON_SEND = 90002;
integer PHOTON_RECEIVE = 90012;

default
{
    link_message(integer sender, integer num, string str, key id)
    {
        if (num == PHOTON_RECEIVE && str == "chat")
        {
            // Parse the text from the payload
            string text = llJsonGetValue((string)id, ["text"]);
            if (text != JSON_INVALID && text != "")
            {
                // Say in local chat
                llSay(0, text);

                // Echo back to the app
                string echoPayload = llList2Json(JSON_OBJECT, [
                    "original", text,
                    "echo", "Echo: " + text
                ]);
                llMessageLinked(LINK_SET, PHOTON_SEND, "echo", echoPayload);
            }
        }
    }
}
