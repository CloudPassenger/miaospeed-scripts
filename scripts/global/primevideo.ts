import { C_FAIL, C_NA, C_UNL, C_UNK } from "@/consts/colors";
import { M_NETWORK, M_STATUS, T_FAIL, T_UNK, T_UNL } from "@/consts/text";
import { UA_WINDOWS } from "@/consts/ua";

function handler(): HandlerResult {
  const response = fetch("https://www.primevideo.com", {
    method: "GET",
    headers: {
      "User-Agent": UA_WINDOWS,
    },
    noRedir: false,
    retry: 3,
    timeout: 5000,
  });

  if (!response) {
    return {
      text: `${T_FAIL}(${M_NETWORK})`,
      background: C_FAIL,
    };
  } else if (response.statusCode !== 200) {
    return {
      text: `${T_FAIL}(${M_STATUS})`,
      background: C_FAIL,
    };
  } else if (response.statusCode === 200) {
    const body = response.body;

    // Check if service is restricted
    const isBlocked = body.includes("isServiceRestricted");
    // Extract current region
    const regionMatch = body.match(/"currentTerritory":"([^"]+)/);
    const region = regionMatch ? regionMatch[1] : null;

    // If service is blocked
    if (isBlocked) {
      return {
        text: T_FAIL,
        background: C_FAIL,
      };
    }

    // If region is found
    if (region) {
      return {
        text: `${T_UNL}(${region})`,
        background: C_UNL,
      };
    }

    return {
      text: T_UNK,
      background: C_UNK,
    };
  } else {
    return {
      text: C_UNK,
      background: C_UNK,
    };
  }
}

export default handler;
