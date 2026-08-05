import { C_FAIL, C_NA, C_UNL } from "@/lib/constants/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/lib/constants/text";
import { UA_WINDOWS } from "@/lib/constants/ua";

// @id: trueid
// @name: TrueID
// @description: 检测 TrueID TV 解锁状态
// @category: media
// @regions: th
// @tags: stream, video, live
// @priority: 45

// https://github.com/oneclickvirt/UnlockTests/blob/main/th/TrueID.go
function handler(): HandlerResult {
  const resp1 = fetch("https://tv.trueid.net/th-en/live/thairathtv-hd", {
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

  const channelIdMatch = resp1.body.match(/"channelId":"([^"]*)"/);
  const buildIdMatch = resp1.body.match(/"buildId":"([^"]*)"/);
  const channelId = channelIdMatch ? channelIdMatch[1] : "";
  const authUser = buildIdMatch ? buildIdMatch[1] : "";

  if (authUser.length < 11) {
    return {
      text: T_NA,
      background: C_NA,
    };
  }
  const authKey = authUser.slice(10);

  const resp2 = fetch(
    `https://tv.trueid.net/api/stream/checkedPlay?channelId=${channelId}&lang=en&country=th`,
    {
      headers: {
        "User-Agent": UA_WINDOWS,
        Authorization: `${authUser}:${authKey}`,
        Accept: "application/json, text/plain, */*",
        Referer: "https://tv.trueid.net/th-en/live/thairathtv-hd",
      },
      retry: 3,
      timeout: 5000,
    }
  );

  if (!resp2) {
    return {
      text: `${T_FAIL}(${M_NETWORK})`,
      background: C_FAIL,
    };
  }

  const billboardMatch = resp2.body.match(/"billboardType":"([^"]*)"/);
  const billboardType = billboardMatch ? billboardMatch[1] : "";

  if (
    billboardType === "GEO_BLOCK" ||
    resp2.body.indexOf("Access denied") > -1 ||
    resp1.statusCode === 401
  ) {
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  }
  if (billboardType === "LOADING") {
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
