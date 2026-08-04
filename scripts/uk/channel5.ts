import { C_FAIL, C_NA, C_UNL, C_WARN } from "@/consts/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/consts/text";
import { UA_WINDOWS } from "@/consts/ua";

// @name: Channel 5
// @description: 检测 Channel 5 解锁状态
// @regions: uk
// @tags: stream, video, live
// @priority: 45

// https://github.com/oneclickvirt/UnlockTests/blob/main/uk/Channel5.go
const CHANNEL5_AUTH = "0_rZDiY0hp_TNcDyk2uD-Kl40HqDbXs7hOawxyqPnbI";

type Channel5Response = {
  code: string;
};

function handler(): HandlerResult {
  const response = fetch(
    `https://cassie.channel5.com/api/v2/live_media/my5desktopng/C5.json?timestamp=${Date.now()}&auth=${encodeURIComponent(
      CHANNEL5_AUTH
    )}`,
    {
      headers: {
        "User-Agent": UA_WINDOWS,
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

  if (response.statusCode === 403) {
    return {
      text: `${T_FAIL}(WAF)`,
      background: C_WARN,
    };
  }

  const res = safeParse<Channel5Response>(response.body);
  const code = get<string>(res, "code", "");

  if (
    code === "3000" ||
    response.body.indexOf("this service is only available in restricted regions") > -1
  ) {
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  }
  if (code === "4003") {
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
