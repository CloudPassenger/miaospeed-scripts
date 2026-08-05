import { C_FAIL, C_NA, C_UNL } from "@/consts/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/consts/text";
import { UA_WINDOWS } from "@/consts/ua";

// @id: channel10
// @name: 10 Play
// @description: 检测 10 Play (Channel 10) 解锁状态
// @category: media
// @regions: au
// @tags: stream, video
// @priority: 45

// https://github.com/oneclickvirt/UnlockTests/blob/main/au/Channel10.go
type Channel10GeoResponse = {
  state: string;
  allow: boolean;
};

function handler(): HandlerResult {
  const resp1 = fetch("https://10play.com.au/geo-web", {
    headers: {
      "User-Agent": UA_WINDOWS,
    },
    retry: 3,
    timeout: 5000,
  });

  if (!resp1) {
    return {
      text: `${T_FAIL}(${M_NETWORK})`,
      background: C_FAIL,
    };
  }
  if (resp1.body.indexOf("Sorry, 10 play is not available in your region.") > -1) {
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  }

  const resp2 = fetch("https://e410fasadvz.global.ssl.fastly.net/geo", {
    headers: {
      "User-Agent": UA_WINDOWS,
    },
    retry: 3,
    timeout: 5000,
  });

  if (!resp2) {
    return {
      text: `${T_FAIL}(${M_NETWORK})`,
      background: C_FAIL,
    };
  }
  if (resp2.body.indexOf("not available") > -1) {
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  }

  const res = safeParse<Channel10GeoResponse>(resp2.body);
  const allow = get<boolean>(res, "allow", false);
  const state = get<string>(res, "state", "");

  if (!allow) {
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  }
  if (state) {
    return {
      text: `${T_UNL}(${state})`,
      background: C_UNL,
    };
  }

  return {
    text: T_NA,
    background: C_NA,
  };
}

export default handler;
