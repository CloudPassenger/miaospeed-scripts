import { C_FAIL, C_NA, C_UNL } from "@/consts/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/consts/text";
import { UA_WINDOWS } from "@/consts/ua";

// @id: 7plus
// @name: 7plus
// @description: 检测 7plus 解锁状态
// @category: media
// @regions: au
// @tags: stream, video
// @priority: 45

// https://github.com/oneclickvirt/UnlockTests/blob/main/au/7Plus.go
type SevenPlusMarketResponse = {
  _id: number;
  place_name: string;
};

function handler(): HandlerResult {
  const response = fetch("https://market-cdn.swm.digital/v1/market/ip/?apikey=web", {
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
    };
  }

  if (response.statusCode === 403 || response.statusCode === 451) {
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  }
  if (response.statusCode !== 200) {
    return {
      text: T_NA,
      background: C_NA,
    };
  }

  const res = safeParse<SevenPlusMarketResponse>(response.body);
  const marketId = get<number>(res, "_id", 0);
  const placeName = get<string>(res, "place_name", "");

  if (marketId === 4) {
    return {
      text: `${T_UNL}(AU)`,
      background: C_UNL,
    };
  }

  return {
    text: `${T_FAIL}${placeName ? `(${placeName})` : ""}`,
    background: C_FAIL,
  };
}

export default handler;
