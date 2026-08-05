import { C_FAIL, C_NA, C_UNL } from "@/lib/constants/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/lib/constants/text";
import { UA_WINDOWS } from "@/lib/constants/ua";

// @id: dmm
// @name: DMM TV
// @description: 检测 DMM TV 解锁状态
// @category: media
// @regions: jp
// @tags: stream, video, anime
// @priority: 41

// https://github.com/HsukqiLee/MediaUnlockTest/blob/main/pkg/providers/DMM.go
function handler(): HandlerResult {
  const response = fetch("https://api.tv.dmm.com/graphql", {
    method: "POST",
    body: JSON.stringify({
      query: "query FetchClient { client { isForeignAccess } }",
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

  if (response.body.indexOf('"isForeignAccess":true') > -1) {
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  }
  if (response.body.indexOf('"isForeignAccess":false') > -1) {
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
