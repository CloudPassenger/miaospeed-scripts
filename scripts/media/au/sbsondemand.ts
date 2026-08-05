import { C_FAIL, C_UNL } from "@/consts/colors";
import { M_NETWORK, T_FAIL, T_UNL } from "@/consts/text";
import { UA_WINDOWS } from "@/consts/ua";

// @id: sbsondemand
// @name: SBS on Demand
// @description: 检测 SBS on Demand 解锁状态
// @category: media
// @regions: au
// @tags: stream, video
// @priority: 45

// https://github.com/oneclickvirt/UnlockTests/blob/main/au/SBSonDemand.go
type SBSResponse = {
  get: {
    response: {
      country_code: string;
    };
  };
};

function handler(): HandlerResult {
  const response = fetch("https://www.sbs.com.au/api/v3/network?context=odwebsite", {
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

  const res = safeParse<SBSResponse>(response.body);
  const countryCode = get<string>(res, "get.response.country_code", "");

  if (countryCode === "AU") {
    return {
      text: T_UNL,
      background: C_UNL,
    };
  }

  return {
    text: `${T_FAIL}${countryCode ? `(${countryCode})` : ""}`,
    background: C_FAIL,
  };
}

export default handler;
