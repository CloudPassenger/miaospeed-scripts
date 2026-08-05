import { C_FAIL, C_NA, C_UNL } from "@/lib/constants/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/lib/constants/text";
import { UA_WINDOWS } from "@/lib/constants/ua";

// @id: copilot
// @name: Microsoft Copilot
// @description: 检测 Microsoft Copilot 在当前地区是否可用
// @category: ai
// @regions: global
// @tags: ai
// @priority: 8

// https://github.com/HsukqiLee/MediaUnlockTest/blob/main/pkg/providers/Copilot.go
type CopilotResponse = {
  regionCode: string;
};

function handler(): HandlerResult {
  const response = fetch("https://copilot.microsoft.com/c/api/user?api-version=2", {
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

  if (response.statusCode === 302) {
    if (response.headers["location"] === "/") {
      return {
        text: `${T_FAIL}(WAF)`,
        background: C_FAIL,
      };
    }
    return {
      text: T_FAIL,
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
    const res = safeParse<CopilotResponse>(response.body);
    const regionCode = get(res, "regionCode", "");
    if (regionCode) {
      return {
        text: `${T_UNL}(${regionCode})`,
        background: C_UNL,
      };
    }
  }

  return {
    text: T_NA,
    background: C_NA,
  };
}

export default handler;
