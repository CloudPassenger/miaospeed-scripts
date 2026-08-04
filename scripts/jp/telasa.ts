import { C_FAIL, C_NA, C_UNL } from "@/consts/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/consts/text";
import { UA_WINDOWS } from "@/consts/ua";

// @name: Telasa
// @description: 检测 Telasa (KDDI) 解锁状态
// @regions: jp
// @tags: stream, video
// @priority: 41

// https://github.com/HsukqiLee/MediaUnlockTest/blob/main/pkg/providers/Telasa.go
type TelasaResponse = {
  Status: {
    Type: string;
    Subtype: string;
  };
};

function handler(): HandlerResult {
  const response = fetch(
    "https://api-videopass-anon.kddi-video.com/v1/playback/system_status",
    {
      headers: {
        "User-Agent": UA_WINDOWS,
        "X-Device-ID": "d36f8e6b-e344-4f5e-9a55-90aeb3403799",
      },
      retry: 3,
      timeout: 5000,
    }
  );

  if (!response) {
    return {
      text: `${T_FAIL}(${M_NETWORK})`,
      background: C_FAIL,
    };
  }

  const res = safeParse<TelasaResponse>(response.body);
  const subtype = get<string>(res, "Status.Subtype", "");
  const type = get<string>(res, "Status.Type", "");

  if (subtype === "IPLocationNotAllowed") {
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  }
  if (type) {
    return {
      text: T_UNL,
      background: C_UNL,
    };
  }

  return {
    text: T_NA,
    background: C_NA,
  };
}

export default handler;
