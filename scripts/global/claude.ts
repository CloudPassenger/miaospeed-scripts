import { C_NA, C_FAIL, C_UNL, C_UNK } from "@/consts/colors";
import { T_FAIL, T_NA, T_UNK, T_UNL } from "@/consts/text";
import { UA_ANDROID } from "@/consts/ua";

// @name: Claude
// @description: 检测 Anthropic Claude 在当前地区是否可用
// @regions: global
// @tags: ai
// @priority: 7

function handler(): HandlerResult {
  const response = fetch("https://claude.ai/login", {
    headers: {
      "User-Agent": UA_ANDROID,
    },
    noRedir: true,
    retry: 3,
    timeout: 5000,
  });
  if (!response) {
    return {
      text: T_NA,
      background: C_NA,
    };
  } else if (response.statusCode == 307) {
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  } else if (response.statusCode == 200) {
    return {
      text: T_UNL,
      background: C_UNL,
    };
  } else {
    return {
      text: T_UNK,
      background: C_UNK,
    };
  }
}

export default handler;
