import { C_FAIL, C_UNL, C_NA, C_WARN } from "@/consts/colors";
import {
  M_NETWORK,
  M_RESPONSE,
  M_STATUS,
  T_FAIL,
  T_NA,
  T_OVERSEAS,
  T_UNL,
} from "@/consts/text";
import { UA_ANDROID } from "@/consts/ua";

function handler(): HandlerResult {
  try {
    const response = fetch("https://api.abema.io/v1/ip/check?device=android", {
      method: "GET",
      headers: { "user-agent": UA_ANDROID },
      noRedir: true,
      retry: 3,
      timeout: 5000,
    });

    if (!response) {
      return {
        text: `${T_FAIL}(${M_NETWORK})`,
        background: C_FAIL,
      };
    } else if (response.statusCode === 200) {
      const content = response.body;
      const data = safeParse(content);

      if (!data) {
        return {
          text: `${T_FAIL}(${M_RESPONSE})`,
          background: C_FAIL,
        };
      }

      const region = data.isoCountryCode || "";

      if (!region) {
        return {
          text: T_FAIL,
          background: C_FAIL,
        };
      }

      if (region === "JP") {
        return {
          text: `${T_UNL}(${region})`,
          background: C_UNL,
        };
      } else {
        return {
          text: `${T_OVERSEAS}(${region})`,
          background: C_WARN,
        };
      }
    } else {
      return {
        text: `${T_FAIL}(${M_STATUS})`,
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
