import { C_FAIL, C_NA, C_UNL } from "@/lib/constants/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/lib/constants/text";
import { UA_WINDOWS } from "@/lib/constants/ua";

// @id: encoretvb
// @name: encoreTVB
// @description: 检测 encoreTVB(北美/海外 TVB 平台) 解锁状态
// @category: media
// @regions: us
// @tags: stream, video
// @priority: 45

// https://github.com/HsukqiLee/MediaUnlockTest/blob/main/pkg/providers/EncoreTVB.go
type EncoreTVBAccountResponse = {
  account_id: string;
};
type EncoreTVBErrorResponse = {
  error_subcode: string;
}[];

function handler(): HandlerResult {
  const response = fetch(
    "https://edge.api.brightcove.com/playback/v1/accounts/5324042807001/videos/6005570109001",
    {
      headers: {
        "User-Agent": UA_WINDOWS,
        Accept:
          "application/json;pk=BCpkADawqM2Gpjj8SlY2mj4FgJJMfUpxTNtHWXOItY1PvamzxGstJbsgc-zFOHkCVcKeeOhPUd9MNHEGJoVy1By1Hrlh9rOXArC5M5MTcChJGU6maC8qhQ4Y8W-QYtvi8Nq34bUb9IOvoKBLeNF4D9Avskfe9rtMoEjj6ImXu_i4oIhYS0dx7x1AgHvtAaZFFhq3LBGtR-ZcsSqxNzVg-4PRUI9zcytQkk_YJXndNSfhVdmYmnxkgx1XXisGv1FG5GOmEK4jZ_Ih0riX5icFnHrgniADr4bA2G7TYh4OeGBrYLyFN_BDOvq3nFGrXVWrTLhaYyjxOr4rZqJPKK2ybmMsq466Ke1ZtE-wNQ",
        Origin: "https://www.encoretvb.com",
      },
      retry: 3,
      timeout: 5000,
    }
  );

  if (!response) {
    return {
      text: `${T_FAIL}(${M_NETWORK})`,
      background: C_FAIL,
    };
  }

  const asObject = safeParse<EncoreTVBAccountResponse>(response.body);
  const accountId = get<string>(asObject, "account_id", "");

  if (accountId && accountId !== "0") {
    return {
      text: T_UNL,
      background: C_UNL,
    };
  }

  const asArray = safeParse<EncoreTVBErrorResponse>(response.body);
  const errorSubcode = get<string>(asArray, "0.error_subcode", "");

  if (errorSubcode === "CLIENT_GEO") {
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
