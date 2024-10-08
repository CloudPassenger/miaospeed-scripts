import { C_FAIL, C_NA, C_UNL } from "@/consts/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/consts/text";
import { UA_WINDOWS } from "@/consts/ua";
import { parseCookies } from "@/utils";

// @name: Steam 货币
// @description: 检测 Steam 货币
// @regions: global
// @tags: game
// @priority: 12

function handler(): HandlerResult {
  const steamResponse = fetch("https://store.steampowered.com", {
    method: "GET",
    headers: {
      "User-Agent": UA_WINDOWS,
    },
    noRedir: false,
    retry: 3,
    timeout: 15000,
  });

  if (!steamResponse || steamResponse.statusCode !== 200) {
    return {
      text: `${T_FAIL}(${M_NETWORK})`,
      background: C_FAIL,
    };
  }

  const cookies = parseCookies(steamResponse.cookies);

  if (cookies["steamCountry"]) {
    const steamCountryValue = cookies["steamCountry"] as string;
    const regionIndex = steamCountryValue.indexOf("%");

    if (regionIndex === -1) {
      return {
        text: T_FAIL,
        background: C_FAIL,
      };
    }
    const region = steamCountryValue.substring(0, regionIndex).toUpperCase();
    return {
      text: `${T_UNL}(${region})`,
      background: C_UNL,
    };
  }

  return {
    text: T_NA,
    background: C_NA,
  };
}

export default handler;