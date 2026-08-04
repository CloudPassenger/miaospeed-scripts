import { C_FAIL, C_NA, C_UNL } from "@/consts/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/consts/text";
import { UA_WINDOWS } from "@/consts/ua";

// @name: Ofiii
// @description: 检测 Ofiii(原 CATCHPLAY 旗下线上影音) 解锁状态
// @regions: tw
// @tags: stream, video
// @priority: 33

// https://github.com/HsukqiLee/MediaUnlockTest/blob/main/pkg/providers/Ofiii.go
function handler(): HandlerResult {
  const response = fetch(
    "https://cdi.ofiii.com/ofiii_cdi/video/urls?device_type=pc&device_id=b4e377ac-8870-43a4-957a-07f95549a03d&media_type=comic&asset_id=vod68157-020020M001&project_num=OFWEB00&puid=dcafe020-e335-49fb-b9c7-52bd9a15c305",
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

  if (response.statusCode === 200) {
    return {
      text: T_UNL,
      background: C_UNL,
    };
  }
  if (response.statusCode === 400 || response.statusCode === 403) {
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
