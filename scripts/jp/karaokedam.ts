import { C_FAIL, C_NA, C_UNL } from "@/consts/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/consts/text";
import { UA_WINDOWS } from "@/consts/ua";

// @name: Karaoke@DAM
// @description: 检测 Karaoke@DAM 解锁状态
// @regions: jp
// @tags: stream, music
// @priority: 45

// https://github.com/HsukqiLee/MediaUnlockTest/blob/main/pkg/providers/Karaoke.go
function handler(): HandlerResult {
  const response = fetch(
    "http://cds1.clubdam.com/vhls-cds1/site/xbox/sample_1.mp4.m3u8",
    {
      headers: {
        "User-Agent": UA_WINDOWS,
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

  if (response.statusCode === 200) {
    return {
      text: T_UNL,
      background: C_UNL,
    };
  }
  if (response.statusCode === 403) {
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  }

  return {
    text: T_NA,
    background: C_NA,
  };
}

export default handler;
