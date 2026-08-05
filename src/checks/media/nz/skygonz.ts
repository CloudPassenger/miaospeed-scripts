import { C_FAIL, C_NA, C_UNL } from "@/lib/constants/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/lib/constants/text";
import { UA_WINDOWS } from "@/lib/constants/ua";

// @id: skygonz
// @name: Sky Go NZ
// @description: 检测 Sky Go 新西兰站解锁状态
// @category: media
// @regions: nz
// @tags: stream, video
// @priority: 45

// https://github.com/oneclickvirt/UnlockTests/blob/main/nz/SkyGO.go
function handler(): HandlerResult {
  const resp1 = fetch("https://linear-s.stream.skyone.co.nz/sky-sport-1.mpd", {
    headers: {
      "User-Agent": UA_WINDOWS,
    },
    retry: 3,
    timeout: 5000,
  });

  if (resp1 && resp1.statusCode === 200) {
    return {
      text: T_UNL,
      background: C_UNL,
    };
  }

  const resp2 = fetch(
    "https://login.sky.co.nz/authorize?audience=https%3A%2F%2Fapi.sky.co.nz&client_id=dXhXjmK9G90mOX3B02R1kV7gsC4bp8yx&redirect_uri=https%3A%2F%2Fwww.skygo.co.nz&connection=Sky-Internal-Connection&scope=openid%20profile%20email%20offline_access&response_type=code&response_mode=query",
    {
      headers: {
        "User-Agent": UA_WINDOWS,
      },
      retry: 3,
      timeout: 5000,
    }
  );

  if (!resp2) {
    return {
      text: `${T_FAIL}(${M_NETWORK})`,
      background: C_FAIL,
    };
  }

  const finalUrl = resp2.url || "";
  if (finalUrl.indexOf("/authorize") === -1 && finalUrl.indexOf("sky.co.nz") > -1) {
    return {
      text: T_UNL,
      background: C_UNL,
    };
  }

  if (
    resp2.body.indexOf("Access Denied") > -1 ||
    resp2.statusCode === 403 ||
    resp2.statusCode === 451 ||
    resp2.statusCode === 200
  ) {
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
