import { C_FAIL, C_NA, C_UNL } from "@/consts/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/consts/text";
import { SEC_CH_UA, UA_WINDOWS } from "@/consts/ua";

function handler(): HandlerResult {
  const response = fetch("https://api2.4gtv.tv/Web/IsTaiwanArea", {
    method: "GET",
    headers: {
      origin: "https://www.4gtv.tv",
      referer: "https://www.4gtv.tv/",
      "accept-language": "en-US,en;q=0.9",
      "sec-ch-ua": SEC_CH_UA,
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Windows"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-site",
      "User-Agent": UA_WINDOWS,
    },
    timeout: 5000,
  });

  if (!response) {
    return {
      text: `${T_FAIL}(${M_NETWORK})`,
      background: C_FAIL,
    };
  }

  try {
    const result = JSON.parse(response.body).Data;
    switch (result) {
      case "N":
        return {
          text: T_FAIL,
          background: C_FAIL,
        };
      case "Y":
        return {
          text: `${T_UNL}(TW)`,
          background: C_UNL,
        };
      default:
        return {
          text: T_FAIL,
          background: C_FAIL,
        };
    }
  } catch (error) {
    return {
      text: T_NA,
      background: C_NA,
    };
  }
}

export default handler;
