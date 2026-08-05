import { C_FAIL, C_NA, C_UNL } from "@/consts/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/consts/text";
import { UA_WINDOWS } from "@/consts/ua";

// @id: aisplay
// @name: AIS Play
// @description: 检测 AIS Play 解锁状态
// @category: media
// @regions: th
// @tags: stream, video, live
// @priority: 45

// https://github.com/oneclickvirt/UnlockTests/blob/main/th/AISPlay.go
function handler(): HandlerResult {
  const response = fetch(
    "https://49-231-37-237-rewriter.ais-vidnt.com/ais/play/origin/VOD/playlist/ais-yMzNH1-bGUxc/index.m3u8",
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

  if (response.statusCode === 403 || response.statusCode === 451) {
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  }

  if (response.statusCode === 200 && response.body.indexOf("X-Geo-Protection-System-Status") > -1) {
    if (response.body.indexOf("ALLOW") > -1) {
      return {
        text: T_UNL,
        background: C_UNL,
      };
    }
    if (response.body.indexOf("BLOCK") > -1) {
      return {
        text: T_FAIL,
        background: C_FAIL,
      };
    }
  }

  return {
    text: T_NA,
    background: C_NA,
  };
}

export default handler;
