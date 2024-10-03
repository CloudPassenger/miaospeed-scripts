import { C_FAIL, C_NA, C_UNL } from "@/consts/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/consts/text";
import { SEC_CH_UA, UA_WINDOWS } from "@/consts/ua";

function handler(): HandlerResult {
  const response = fetch("https://www.meta.ai/", {
    method: "GET",
    headers: {
      Accept: "*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "Accept-Language": "en-US,en;q=0.9",
      "Sec-CH-UA": SEC_CH_UA,
      "Sec-CH-UA-Mobile": "?0",
      "Sec-CH-UA-Platform": '"Windows"',
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Sec-Fetch-User": "?1",
      "Upgrade-Insecure-Requests": "1",
      "User-Agent": UA_WINDOWS,
    },
    noRedir: false,
    retry: 3,
    timeout: 5000,
  });

  // Check if response is valid
  if (!response) {
    return {
      text: `${T_FAIL}(${M_NETWORK})`,
      background: C_FAIL,
    };
  } else if (response.statusCode !== 200) {
    return {
      text: `${T_FAIL}(${response.statusCode})`,
      background: C_FAIL,
    };
  } else if (response.statusCode === 200) {
    const content = response.body;

    println(content); // Be sure to get the content
    // Check for block or success indicators
    const isBlocked = content.indexOf("AbraGeoBlockedErrorRoot") > -1;
    const isOK = content.indexOf("AbraHomeRootConversationQuery") > -1;

    if (!isBlocked && !isOK) {
      return {
        text: T_FAIL,
        background: C_FAIL,
      };
    }

    if (isBlocked) {
      return {
        text: T_FAIL,
        background: C_FAIL,
      };
    }

    if (isOK) {
      const regionMatch = content.match(/"code"\s*:\s*"([^"]+)/);
      const region = regionMatch ? regionMatch[1].split("_")[1] : "Unknown";

      return {
        text: `${T_UNL}(${region})`,
        background: C_UNL,
      };
    }
  } else {
    return {
      text: T_NA,
      background: C_NA,
    };
  }
}

export default handler;
