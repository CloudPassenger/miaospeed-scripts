// @id: starz
// @name: Starz
// @description: 检测 Starz 解锁状态
// @category: media
// @regions: us
// @tags: stream, video
// @priority: 45

import { C_FAIL, C_NA, C_UNL, C_WARN } from "@/lib/constants/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/lib/constants/text";
import { UA_WINDOWS } from "@/lib/constants/ua";
import { S_FAIL, S_NA, S_UNL, S_WARN } from "@/lib/constants/status";

// https://github.com/HsukqiLee/MediaUnlockTest/blob/main/pkg/providers/StarZ.go
type StarzGeoResponse = {
  IsAllowedAccess: boolean;
  IsAllowedCountry: boolean;
  IsKnownProxy: boolean;
};

function handler(): HandlerResult {
  const resp1 = fetch("https://www.starz.com/sapi/header/v1/starz/us/109448574b2147ccbc494b429ff5ef1b", {
    headers: {
      "User-Agent": UA_WINDOWS,
      Referer: "https://www.starz.com/us/en/",
    },
    retry: 3,
    timeout: 5000,
  });

  if (!resp1) {
    return {
      text: `${T_FAIL}(${M_NETWORK})`,
      background: C_FAIL,
      status: S_FAIL,
      error: M_NETWORK,
    };
  }
  if (resp1.statusCode === 403) {
    return { text: `${T_FAIL}(WAF)`, background: C_WARN, status: S_WARN, statusReason: "waf_blocked" };
  }

  const authorization = resp1.body;

  const resp2 = fetch("https://auth.starz.com/api/v4/User/geolocation", {
    headers: {
      "User-Agent": UA_WINDOWS,
      AuthTokenAuthorization: authorization,
      BestAvailableToken: "true",
      Origin: "https://www.starz.com",
      Referer: "https://www.starz.com/",
    },
    retry: 3,
    timeout: 5000,
  });

  if (!resp2) {
    return {
      text: `${T_FAIL}(${M_NETWORK})`,
      background: C_FAIL,
      status: S_FAIL,
      error: M_NETWORK,
    };
  }

  const res = safeParse<StarzGeoResponse>(resp2.body);
  const allowed =
    get<boolean>(res, "IsAllowedAccess", false) &&
    get<boolean>(res, "IsAllowedCountry", false) &&
    !get<boolean>(res, "IsKnownProxy", false);

  if (allowed) {
    return {
      text: T_UNL,
      background: C_UNL,
      status: S_UNL,
    };
  }
  if (res) {
    return {
      text: T_FAIL,
      background: C_FAIL,
      status: S_FAIL,
    };
  }

  return {
    text: T_NA,
    background: C_NA,
    status: S_NA,
  };
}

export default handler;
