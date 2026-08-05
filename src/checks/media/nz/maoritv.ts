import { C_FAIL, C_NA, C_UNL } from "@/lib/constants/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/lib/constants/text";
import { UA_WINDOWS } from "@/lib/constants/ua";

// @id: maoritv
// @name: Māori Television
// @description: 检测 Whakaata Māori(Māori Television) 解锁状态
// @category: media
// @regions: nz
// @tags: stream, video, live
// @priority: 45

// https://github.com/oneclickvirt/UnlockTests/blob/main/nz/MaoriTV.go
type MaoriTVAccountResponse = {
  account_id: string;
};
type MaoriTVErrorResponse = {
  error_subcode: string;
}[];

function handler(): HandlerResult {
  const response = fetch(
    "https://edge.api.brightcove.com/playback/v1/accounts/1614493167001/videos/6352727601112",
    {
      headers: {
        "User-Agent": UA_WINDOWS,
        Accept:
          "application/json;pk=BCpkADawqM2E9yW4lLgKIEIV5majz5djzZCIqJiYMkP5yYaYdF6AQYq4isPId1ZLtQdGnK1ErLYG0-r1N-3DzAEdbfvw9SFdDWz_i09pLp8Njx1ybslyIXid-X_Dx31b7-PLdQhJCws-vk6Y",
        Origin: "https://www.maoritelevision.com",
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

  if (response.body.indexOf("CLIENT_GEO") > -1 || response.body.indexOf("ACCESS_DENIED") > -1) {
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  }

  const asObject = safeParse<MaoriTVAccountResponse>(response.body);
  const accountId = get<string>(asObject, "account_id", "");

  if (accountId && accountId !== "0") {
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
