import { C_FAIL, C_UNL, C_NA, C_UNK } from "@/consts/colors";
import {
  M_NETWORK,
  T_ALLOW,
  T_DENY,
  T_FAIL,
  T_PASS,
  T_UNK,
} from "@/consts/text";
import { SEC_CH_UA, UA_WINDOWS } from "@/consts/ua";

// @name: Reddit
// @description: 检测 Reddit 是否可匿名浏览
// @regions: global
// @tags: social
// @priority: 11

function handler() {
  const redditResponse = fetch("https://www.reddit.com/", {
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

  if (!redditResponse) {
    return {
      text: `${T_FAIL}(${M_NETWORK})`,
      background: C_FAIL,
    };
  }

  const statusCode = redditResponse.statusCode;
  const body = redditResponse.body;

  if (statusCode === 200 || statusCode === 302) {
    return {
      text: T_ALLOW,
      background: C_UNL,
    };
  }

  if (statusCode === 403 && body.includes("blocked")) {
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  }

  return {
    text: T_UNK,
    background: C_UNK,
  };
}

export default handler;