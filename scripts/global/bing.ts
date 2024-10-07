import { C_FAIL, C_UNK, C_UNL } from "@/consts/colors";
import { M_NETWORK, T_FAIL, T_UNK, T_UNL } from "@/consts/text";
import { SEC_CH_UA, UA_WINDOWS } from "@/consts/ua";

// @name: Bing
// @description: 检测 Bing 是否为国际版
// @regions: global
// @tags: tool, ai
// @priority: 6

function handler(): HandlerResult {
  const response = fetch("https://www.bing.com/", {
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
    timeout: 15000,
  });

  if (!response || response.statusCode !== 200) {
    return {
      text: `${T_FAIL}(${M_NETWORK})`,
      background: C_FAIL,
    };
  }

  const body = response.body;

  const match = body.match(/Region:"([^"]*)"/);
  const region = match && match[1] ? match[1] : "";

  if (region === "CN") {
    return {
      text: `${T_FAIL}(CN)`,
      background: C_FAIL,
    };
  } else if (body.indexOf("cn.bing.com") > -1) {
    return {
      text: `${T_FAIL}(CN)`,
      background: C_FAIL,
    };
  } else if (region) {
    return {
      text: `${T_UNL}(${region})`,
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