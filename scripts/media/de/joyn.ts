import { C_FAIL, C_NA, C_UNL } from "@/consts/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/consts/text";
import { UA_WINDOWS } from "@/consts/ua";

// @id: joyn
// @name: Joyn
// @description: 检测 Joyn 解锁状态
// @category: media
// @regions: de
// @tags: stream, video, live
// @priority: 45

// https://github.com/HsukqiLee/MediaUnlockTest/blob/main/pkg/providers/Joyn.go
type JoynAuthResponse = {
  access_token: string;
};

type JoynEntitlementResponse = {
  entitlement_token: string;
};

function handler(): HandlerResult {
  const authResp = fetch("https://auth.joyn.de/auth/anonymous", {
    method: "POST",
    body: JSON.stringify({
      client_id: "b74b9f27-a994-4c45-b7eb-5b81b1c856e7",
      client_name: "web",
      anon_device_id: "b74b9f27-a994-4c45-b7eb-5b81b1c856e7",
    }),
    headers: {
      "User-Agent": UA_WINDOWS,
      "Content-Type": "application/json",
    },
    retry: 3,
    timeout: 5000,
  });

  if (!authResp) {
    return {
      text: `${T_FAIL}(${M_NETWORK})`,
      background: C_FAIL,
    };
  }

  const authRes = safeParse<JoynAuthResponse>(authResp.body);
  const accessToken = get<string>(authRes, "access_token", "");

  if (!accessToken) {
    return {
      text: T_NA,
      background: C_NA,
    };
  }

  const entResp = fetch("https://api.joyn.de/content/entitlement-token", {
    method: "POST",
    body: JSON.stringify({ content_id: "daserste-de-hd", content_type: "LIVE" }),
    headers: {
      "User-Agent": UA_WINDOWS,
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      "x-api-key": "36lp1t4wto5uu2i2nk57ywy9on1ns5yg",
    },
    retry: 3,
    timeout: 5000,
  });

  if (!entResp) {
    return {
      text: `${T_FAIL}(${M_NETWORK})`,
      background: C_FAIL,
    };
  }

  if (entResp.body.indexOf("ENT_AssetNotAvailableInCountry") > -1) {
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  }

  const entRes = safeParse<JoynEntitlementResponse>(entResp.body);
  const token = get<string>(entRes, "entitlement_token", "");

  if (token) {
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
