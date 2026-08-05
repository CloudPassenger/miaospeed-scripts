// @id: deepseek
// @name: DeepSeek
// @description: 检测 DeepSeek (chat.deepseek.com) 在当前地区是否可用
// @category: ai
// @regions: global
// @tags: ai
// @priority: 8

import { C_FAIL, C_NA, C_UNL } from "@/lib/constants/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/lib/constants/text";
import { UA_WINDOWS } from "@/lib/constants/ua";

// https://github.com/HsukqiLee/MediaUnlockTest/blob/main/pkg/providers/DeepSeek.go
// 直连固定 IP + 自定义 SNI/Host，绕开可能的国内解析劫持
function handler(): HandlerResult {
  const response = fetch("https://116.205.40.114/sign_in", {
    headers: {
      "User-Agent": UA_WINDOWS,
      Host: "chat.deepseek.com",
    },
    sni: "chat.deepseek.com",
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
    const match = response.body.match(/<meta\s+name="region"\s+content="([^"]+)"/);
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
