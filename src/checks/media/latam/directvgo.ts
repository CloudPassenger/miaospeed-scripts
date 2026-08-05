import { C_FAIL, C_NA, C_UNL } from "@/lib/constants/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/lib/constants/text";
import { UA_WINDOWS } from "@/lib/constants/ua";

// @id: directvgo
// @name: DirecTV GO
// @description: 检测 DirecTV GO(拉美) 解锁状态
// @category: media
// @regions: latam
// @tags: stream, video
// @priority: 45

// https://github.com/HsukqiLee/MediaUnlockTest/blob/main/pkg/providers/DirecTVGO.go
function handler(): HandlerResult {
  const response = fetch("https://www.directvgo.com/registrarse", {
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

  if (response.statusCode === 301) {
    return {
      text: T_UNL,
      background: C_UNL,
    };
  }
  if (response.statusCode === 403 || response.statusCode === 200) {
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
