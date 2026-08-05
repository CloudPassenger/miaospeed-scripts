import { C_FAIL, C_NA, C_UNL } from "@/consts/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/consts/text";
import { UA_WINDOWS } from "@/consts/ua";

// @id: crave
// @name: Crave
// @description: 检测 Crave 解锁状态
// @category: media
// @regions: ca
// @tags: stream, video
// @priority: 45

// https://github.com/oneclickvirt/UnlockTests/blob/main/ca/Crave.go
function handler(): HandlerResult {
  const response = fetch(
    "https://capi.9c9media.com/destinations/se_atexace/platforms/desktop/bond/contents/2205173/contentpackages/4279732/manifest.mpd",
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

  if (response.body.indexOf("Geo Constraint Restrictions") > -1 || response.statusCode === 404) {
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  }
  if (response.body.indexOf("video.9c9media.com") > -1) {
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
