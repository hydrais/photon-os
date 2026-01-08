// ============================================
// PhotonTool.lsl - Photon Tool Command Bridge
// ============================================
// Add this script alongside PhotonDevice.lsl
// to forward commands from Photon OS to the
// Photon Tool's command handler.

// PhotonDevice link message channels
integer PHOTON_RECEIVE = 90012;

default
{
    link_message(integer sender, integer num, string str, key id)
    {
        if (num == PHOTON_RECEIVE && str == "command")
        {
            string command = llJsonGetValue((string)id, ["command"]);
            if (command != JSON_INVALID && command != "")
            {
                // Forward to Photon Tool on channel 0
                llMessageLinked(LINK_SET, 0, command, NULL_KEY);
            }
        }
    }
}
