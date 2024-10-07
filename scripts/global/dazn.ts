import { C_FAIL, C_UNL, C_NA } from "@/consts/colors";
import {
  M_NETWORK,
  M_RESPONSE,
  T_FAIL,
  T_NA,
  T_UNK,
  T_UNL,
} from "@/consts/text";
import { UA_WINDOWS } from "@/consts/ua";

// @name: Dazn
// @description: 检测 Dazn 在当前地区是否可用
// @regions: global
// @tags: stream, video
// @priority: 4

function handler(): HandlerResult {
  const response = fetch("https://startup.core.indazn.com/misl/v5/Startup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": UA_WINDOWS,
    },
    body: JSON.stringify({
      LandingPageKey: "generic",
      languages: "en-US,en",
      Platform: "web",
      PlatformAttributes: {},
      Manufacturer: "",
      PromoCode: "",
      Version: "2",
    }),
    noRedir: false,
    retry: 3,
    timeout: 5000,
  });

  if (!response) {
    return {
      text: `${T_FAIL}(${M_NETWORK})`,
      background: C_FAIL,
    };
  } else if (response.statusCode === 200) {
    const data = safeParse(response.body);

    if (!data) {
      return {
        text: `${T_FAIL}(${M_RESPONSE})`,
        background: C_FAIL,
      };
    }

    const isAllowed = data.Region.isAllowed;
    const region = data.Region.GeolocatedCountry.toUpperCase();

    if (isAllowed) {
      return {
        text: `${T_UNL}(${region})`,
        background: C_UNL,
      };
    } else {
      return {
        text: T_NA,
        background: C_NA,
      };
    }
  } else {
    return {
      text: `${T_UNK}(${response.statusCode})`,
      background: C_FAIL,
    };
  }
}

export default handler;
