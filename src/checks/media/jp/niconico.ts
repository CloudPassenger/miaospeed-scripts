// @id: niconico
// @name: Niconico
// @description: 检测 Niconico 动画/直播 解锁状态
// @category: media
// @regions: jp
// @tags: stream, video, anime
// @priority: 41

import { C_FAIL, C_UNL } from "@/lib/constants/colors";
import { M_NETWORK, T_FAIL, T_UNL } from "@/lib/constants/text";
import { UA_WINDOWS } from "@/lib/constants/ua";
import { S_FAIL, S_UNL } from "@/lib/constants/status";

// https://github.com/HsukqiLee/MediaUnlockTest/blob/main/pkg/providers/NicoNico.go
function handler(): HandlerResult {
  const response = fetch("https://www.nicovideo.jp/watch/so40278367", {
    headers: {
      "User-Agent": UA_WINDOWS,
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

  if (response.body.indexOf("同じ地域") > -1) {
    return {
      text: T_FAIL,
      background: C_FAIL,
      status: S_FAIL,
    };
  }

  return {
    text: T_UNL,
    background: C_UNL,
    status: S_UNL,
  };
}

export default handler;
