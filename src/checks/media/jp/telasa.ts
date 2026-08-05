// @id: telasa
// @name: Telasa
// @description: 检测 Telasa (KDDI) 解锁状态
// @category: media
// @regions: jp
// @tags: stream, video
// @priority: 41

import { C_FAIL, C_NA, C_UNL } from "@/lib/constants/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/lib/constants/text";
import { UA_WINDOWS } from "@/lib/constants/ua";
import { S_FAIL, S_NA, S_UNL } from "@/lib/constants/status";

// https://github.com/HsukqiLee/MediaUnlockTest/blob/main/pkg/providers/Telasa.go
type TelasaResponse = {
  Status: {
    Type: string;
    Subtype: string;
  };
};

function handler(): HandlerResult {
  const response = fetch("https://api-videopass-anon.kddi-video.com/v1/playback/system_status", {
    headers: {
      "User-Agent": UA_WINDOWS,
      "X-Device-ID": "d36f8e6b-e344-4f5e-9a55-90aeb3403799",
    },
    retry: 3,
    timeout: 5000,
  });

  if (!response) {
    return {
      text: `${T_FAIL}(${M_NETWORK})`,
      background: C_FAIL,
      status: S_FAIL,
      error: M_NETWORK,
    };
  }

  const res = safeParse<TelasaResponse>(response.body);
  const subtype = get<string>(res, "Status.Subtype", "");
  const type = get<string>(res, "Status.Type", "");

  if (subtype === "IPLocationNotAllowed") {
    return {
      text: T_FAIL,
      background: C_FAIL,
      status: S_FAIL,
    };
  }
  if (type) {
    return {
      text: T_UNL,
      background: C_UNL,
      status: S_UNL,
    };
  }

  return {
    text: T_NA,
    background: C_NA,
    status: S_NA,
  };
}

export default handler;
