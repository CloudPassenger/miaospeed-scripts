import { C_FAIL, C_NA, C_UNL } from "@/consts/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/consts/text";
import { UA_WINDOWS } from "@/consts/ua";

// @name: Wowow
// @description: 检测 Wowow On Demand 解锁状态
// @regions: jp
// @tags: stream, video
// @priority: 41

// https://github.com/HsukqiLee/MediaUnlockTest/blob/main/pkg/providers/Wowow.go
type WowowResponse = {
  error: {
    code: number;
  };
};

function handler(): HandlerResult {
  const response = fetch("https://mapi.wowow.co.jp/api/v1/playback/auth", {
    method: "POST",
    body: JSON.stringify({ meta_id: 81174 }),
    headers: {
      "User-Agent": UA_WINDOWS,
      "Content-Type": "application/json",
    },
    retry: 3,
    timeout: 5000,
  });

  if (!response) {
    return {
      text: `${T_FAIL}(${M_NETWORK})`,
      background: C_FAIL,
    };
  }

  if (response.statusCode === 403) {
    const res = safeParse<WowowResponse>(response.body);
    const code = get<number>(res, "error.code", 0);
    if (code === 2055) {
      return {
        text: T_FAIL,
        background: C_FAIL,
      };
    }
    if (code === 2041 || code === 2003) {
      return {
        text: T_UNL,
        background: C_UNL,
      };
    }
  }

  return {
    text: T_NA,
    background: C_NA,
  };
}

export default handler;
