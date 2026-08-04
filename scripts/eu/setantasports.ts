import { C_FAIL, C_NA, C_UNL, C_WARN } from "@/consts/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/consts/text";
import { UA_WINDOWS } from "@/consts/ua";

// @name: Setanta Sports
// @description: 检测 Setanta Sports 解锁状态
// @regions: eu
// @tags: stream, live
// @priority: 45

// https://github.com/HsukqiLee/MediaUnlockTest/blob/main/pkg/providers/SetantaSports.go
type SetantaConsentResponse = {
  outsideAllowedTerritories: boolean;
};

type SetantaCountryResponse = {
  callerCountryCode: string;
};

function handler(): HandlerResult {
  const response = fetch(
    "https://dce-frontoffice.imggaming.com/api/v2/consent-prompt",
    {
      headers: {
        "User-Agent": UA_WINDOWS,
        Realm: "dce.adjara",
        "x-api-key": "857a1e5d-e35e-4fdf-805b-a87b6f8364bf",
      },
      retry: 3,
      timeout: 10000,
    }
  );

  if (!response) {
    return {
      text: `${T_FAIL}(${M_NETWORK})`,
      background: C_FAIL,
    };
  }
  if (response.statusCode === 403) {
    return {
      text: `${T_FAIL}(WAF)`,
      background: C_WARN,
    };
  }

  const res = safeParse<SetantaConsentResponse>(response.body);
  const outside = get<boolean>(res, "outsideAllowedTerritories", null as any);

  const countryResp = fetch(
    "https://dce-frontoffice.imggaming.com/api/v3/i18n/country-codes",
    {
      headers: {
        "User-Agent": UA_WINDOWS,
        Realm: "dce.adjara",
        "x-api-key": "857a1e5d-e35e-4fdf-805b-a87b6f8364bf",
      },
      retry: 3,
      timeout: 10000,
    }
  );
  const countryRes = countryResp
    ? safeParse<SetantaCountryResponse>(countryResp.body)
    : null;
  const region = get<string>(countryRes, "callerCountryCode", "").toLowerCase();

  if (outside === null) {
    return {
      text: T_NA,
      background: C_NA,
    };
  }
  if (outside) {
    return {
      text: `${T_FAIL}${region ? `(${region})` : ""}`,
      background: C_FAIL,
    };
  }

  return {
    text: `${T_UNL}${region ? `(${region})` : ""}`,
    background: C_UNL,
  };
}

export default handler;
