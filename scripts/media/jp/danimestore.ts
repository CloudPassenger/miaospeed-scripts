import { C_FAIL, C_NA, C_UNL } from "@/consts/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/consts/text";
import { UA_WINDOWS } from "@/consts/ua";

// @id: danimestore
// @name: dアニメストア
// @description: 检测 dアニメストア(d Anime Store) 解锁状态
// @category: media
// @regions: jp
// @tags: stream, video, anime
// @priority: 41

// https://github.com/HsukqiLee/MediaUnlockTest/blob/main/pkg/providers/DAnimeStore.go
function handler(): HandlerResult {
  const response = fetch("https://animestore.docomo.ne.jp/animestore/reg_pc", {
    headers: {
      "User-Agent": UA_WINDOWS,
    },
    noRedir: true,
    retry: 3,
    timeout: 5000,
  });

  if (!response) {
    return {
      text: `${T_FAIL}(${M_NETWORK})`,
      background: C_FAIL,
    };
  }

  if (response.body.indexOf("海外") > -1) {
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  }

  if (response.statusCode === 302) {
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
