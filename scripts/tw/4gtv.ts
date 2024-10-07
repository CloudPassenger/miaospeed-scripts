import { C_FAIL, C_NA, C_UNL } from "@/consts/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/consts/text";
import { UA_WINDOWS } from "@/consts/ua";

// @name: 4GTV
// @description: 检测 4GTV 解锁状态
// @regions: tw
// @tags: stream, video, live
// @priority: 35

type ResponseBody = {
  Success?: boolean;
  Status?: number;
  ErrMessage?: string;
};

function handler(): HandlerResult {
  const response = fetch("https://api2.4gtv.tv/Vod/GetVodUrl3", {
    method: "POST",
    body: "value=D33jXJ0JVFkBqV%2BZSi1mhPltbejAbPYbDnyI9hmfqjKaQwRQdj7ZKZRAdb16%2FRUrE8vGXLFfNKBLKJv%2BfDSiD%2BZJlUa5Msps2P4IWuTrUP1%2BCnS255YfRadf%2BKLUhIPj",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": UA_WINDOWS,
    },
    noRedir: false,
    retry: 3,
    timeout: 15000,
  });

  if (!response || response.statusCode !== 200) {
    return {
      text: `${T_FAIL}(${M_NETWORK})`,
      background: C_FAIL,
    };
  }

  const body = response.body;
  const data = safeParse<ResponseBody>(body);

  if (data.Success) {
    return {
      text: T_UNL,
      background: C_UNL,
    };
  } else {
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  }
}

export default handler;
