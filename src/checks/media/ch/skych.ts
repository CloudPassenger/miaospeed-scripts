import { C_FAIL, C_NA, C_UNL, C_WARN } from "@/lib/constants/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/lib/constants/text";
import { UA_WINDOWS } from "@/lib/constants/ua";

// @id: skych
// @name: Sky CH
// @description: 检测 Sky Switzerland 解锁状态
// @category: media
// @regions: ch
// @tags: stream, video
// @priority: 45

// https://github.com/oneclickvirt/UnlockTests/blob/main/ch/Sky.go
function handler(): HandlerResult {
  const resp1 = fetch("https://gateway.prd.sky.ch/user/customer/create", {
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

  if (resp1.statusCode === 403) {
    if (resp1.body === '{"message": "", "code": "GEO_BLOCKED"}') {
      return {
        text: T_FAIL,
        background: C_FAIL,
      };
    }
    return {
      text: `${T_FAIL}(WAF)`,
      background: C_WARN,
    };
  }

  if (resp1.statusCode === 405) {
    return {
      text: T_UNL,
      background: C_UNL,
    };
  }

  const resp2 = fetch("https://sky.ch/", {
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

  if (
    resp2.body.indexOf("out-of-country") > -1 ||
    resp2.body.indexOf("Are you using a VPN") > -1 ||
    resp2.body.indexOf("Are you using a Proxy or similar Anonymizer technics") > -1
  ) {
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  }
  if (resp2.statusCode === 200) {
    return {
      text: T_UNL,
      background: C_UNL,
    };
  }

  return {
    text: T_NA,
    background: C_NA,
  };
}

export default handler;
