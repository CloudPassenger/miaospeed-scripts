// @id: molotov
// @name: Molotov
// @description: 检测 Molotov 解锁状态
// @category: media
// @regions: fr
// @tags: stream, video, live
// @priority: 45

import { C_FAIL, C_NA, C_UNL, C_WARN } from "@/lib/constants/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/lib/constants/text";
import { UA_WINDOWS } from "@/lib/constants/ua";
import { S_FAIL, S_NA, S_UNL, S_WARN } from "@/lib/constants/status";

// https://github.com/HsukqiLee/MediaUnlockTest/blob/main/pkg/providers/Molotov.go
type MolotovResponse = {
  is_france: boolean;
};

function handler(): HandlerResult {
  const response = fetch("https://fapi.molotov.tv/v1/open-europe/is-france", {
    headers: {
      "User-Agent": UA_WINDOWS,
    },
    retry: 3,
    timeout: 5000,
  });

  if (!response) {
    return {
      text: `${T_FAIL}(${M_NETWORK})`,
      background: C_FAIL,
      status: S_FAIL,
      error: M_NETWORK,
    };
  }

  if (response.statusCode === 502) {
    return {
      text: `${T_FAIL}(WAF)`,
      background: C_WARN,
      status: S_WARN,
    };
  }
  if (response.statusCode !== 200) {
    return {
      text: T_FAIL,
      background: C_FAIL,
      status: S_FAIL,
    };
  }

  const res = safeParse<MolotovResponse>(response.body);
  const isFrance = get<boolean>(res, "is_france", false);

  if (isFrance) {
    return {
      text: T_UNL,
      background: C_UNL,
      status: S_UNL,
    };
  }

  return {
    text: T_NA,
    background: C_NA,
    status: S_NA,
  };
}

export default handler;
