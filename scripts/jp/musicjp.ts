import { C_FAIL, C_UNL } from "@/consts/colors";
import { M_NETWORK, T_FAIL, T_UNL } from "@/consts/text";
import { UA_WINDOWS } from "@/consts/ua";

// @name: music.jp
// @description: 检测 music.jp 解锁状态
// @regions: jp
// @tags: stream, music
// @priority: 41

// https://github.com/HsukqiLee/MediaUnlockTest/blob/main/pkg/providers/MusicJP.go
function handler(): HandlerResult {
  const response = fetch("https://overseaauth.music-book.jp/globalIpcheck.js", {
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
    };
  }

  if (!response.body) {
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  }

  return {
    text: T_UNL,
    background: C_UNL,
  };
}

export default handler;
