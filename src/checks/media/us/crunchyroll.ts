import { C_FAIL, C_UNL } from "@/lib/constants/colors";
import { M_NETWORK, T_FAIL, T_UNL } from "@/lib/constants/text";
import { UA_WINDOWS } from "@/lib/constants/ua";

// @id: crunchyroll
// @name: Crunchyroll
// @description: 检测 Crunchyroll 解锁状态
// @category: media
// @regions: us
// @tags: stream, video, anime
// @priority: 40

// https://github.com/HsukqiLee/MediaUnlockTest/blob/main/pkg/providers/Crunchyroll.go
function handler(): HandlerResult {
  const response = fetch("https://www.crunchyroll.com/auth/v1/token", {
    method: "POST",
    body: "grant_type=client_id",
    headers: {
      "User-Agent": UA_WINDOWS,
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic Y3Jfd2ViOg==",
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

  if (response.body.indexOf('"country":"US"') > -1) {
    return {
      text: T_UNL,
      background: C_UNL,
    };
  }

  return {
    text: T_FAIL,
    background: C_FAIL,
  };
}

export default handler;
