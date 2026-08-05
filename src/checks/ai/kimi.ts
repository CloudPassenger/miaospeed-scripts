// @id: kimi
// @name: Kimi
// @description: 检测月之暗面 Kimi (kimi.com) 在当前地区是否可用
// @category: ai
// @regions: global
// @tags: ai
// @priority: 8

import { C_FAIL, C_NA, C_UNL } from "@/lib/constants/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/lib/constants/text";
import { UA_WINDOWS } from "@/lib/constants/ua";

// https://github.com/HsukqiLee/MediaUnlockTest/blob/main/pkg/providers/Kimi.go
function handler(): HandlerResult {
  const response = fetch("https://www.kimi.com/apiv2/kimi.gateway.order.v1.GoodsService/ListGoods", {
    method: "POST",
    body: "{}",
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

  if (response.statusCode === 403) {
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  }

  if (response.statusCode === 200) {
    const match = response.body.match(/"useRegion":"REGION_([^"]+)"/);
    const region = match ? match[1] : "";
    if (region) {
      return {
        text: `${T_UNL}(${region})`,
        background: C_UNL,
      };
    }
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
