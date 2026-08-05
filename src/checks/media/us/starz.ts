import { C_FAIL, C_NA, C_UNL, C_WARN } from "@/lib/constants/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/lib/constants/text";
import { UA_WINDOWS } from "@/lib/constants/ua";

// @id: starz
// @name: Starz
// @description: 检测 Starz 解锁状态
// @category: media
// @regions: us
// @tags: stream, video
// @priority: 45

// https://github.com/HsukqiLee/MediaUnlockTest/blob/main/pkg/providers/StarZ.go
type StarzGeoResponse = {
  IsAllowedAccess: boolean;
  IsAllowedCountry: boolean;
  IsKnownProxy: boolean;
};

function handler(): HandlerResult {
  const resp1 = fetch(
    "https://www.starz.com/sapi/header/v1/starz/us/109448574b2147ccbc494b429ff5ef1b",
    {
      headers: {
        "User-Agent": UA_WINDOWS,
        Referer: "https://www.starz.com/us/en/",
      },
      retry: 3,
      timeout: 5000,
    }
  );

  if (!resp1) {
    return {
      text: `${T_FAIL}(${M_NETWORK})`,
      background: C_FAIL,
    };
  }
  if (resp1.statusCode === 403) {
    return {
      text: `${T_FAIL}(WAF)`,
      background: C_WARN,
    };
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
    };
  }
  if (res) {
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  }

  return {
    text: T_NA,
    background: C_NA,
  };
}

export default handler;
