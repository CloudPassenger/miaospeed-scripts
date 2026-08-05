// @id: tver
// @name: TVer
// @description: 检测 TVer 解锁状态
// @category: media
// @regions: jp
// @tags: stream, video
// @priority: 41

import { C_FAIL, C_NA, C_UNL } from "@/lib/constants/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/lib/constants/text";
import { UA_WINDOWS } from "@/lib/constants/ua";

// https://github.com/HsukqiLee/MediaUnlockTest/blob/main/pkg/providers/TVer.go
function handler(): HandlerResult {
  const response = fetch("https://playback.api.streaks.jp/v1/projects/tver-simul-ntv/medias/ref:simul-ntv", {
    headers: {
      "User-Agent": UA_WINDOWS,
      "x-streaks-api-key": "ntv",
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
