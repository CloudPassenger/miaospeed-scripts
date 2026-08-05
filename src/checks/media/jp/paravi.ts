// @id: paravi
// @name: Paravi
// @description: 检测 Paravi 解锁状态
// @category: media
// @regions: jp
// @tags: stream, video
// @priority: 41

import { C_FAIL, C_NA, C_UNL } from "@/lib/constants/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/lib/constants/text";
import { UA_WINDOWS } from "@/lib/constants/ua";

// https://github.com/HsukqiLee/MediaUnlockTest/blob/main/pkg/providers/Paravi.go
type ParaviResponse = {
  error: {
    type: string;
  };
};

function handler(): HandlerResult {
  const response = fetch("https://api.paravi.jp/api/v1/playback/auth", {
    method: "POST",
    body: JSON.stringify({
      meta_id: 17414,
      vuid: "3b64a775a4e38d90cc43ea4c7214702b",
      device_code: 1,
      app_id: 1,
    }),
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
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  }

  const res = safeParse<ParaviResponse>(response.body);
  const errorType = get<string>(res, "error.type", "");

  if (errorType === "Unauthorized") {
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
