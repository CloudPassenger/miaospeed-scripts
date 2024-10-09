import { C_FAIL, C_UNL } from "@/consts/colors";
import { M_NETWORK, M_STATUS, T_FAIL, T_UNL } from "@/consts/text";
import { UA_WINDOWS } from "@/consts/ua";

// @name: KBS
// @description: 检测 KBS 的解锁状态
// @regions: kr
// @tags: stream, ott
// @priority: 50

function handler(): HandlerResult {
  const response = fetch(
    "https://vod.kbs.co.kr/index.html?source=episode&sname=vod&stype=vod&program_code=T2022-0690&program_id=PS-2022164275-01-000&broadcast_complete_yn=N&local_station_code=00&section_code=03",
    {
      method: "GET",
      headers: {
        "User-Agent": UA_WINDOWS,
      },
      noRedir: false,
      retry: 3,
      timeout: 15000,
    }
  );

  if (!response || response.statusCode !== 200) {
    return {
      text: `${T_FAIL}(${M_NETWORK})`,
      background: C_FAIL,
    };
  }

  const body = response.body;

  if (body.includes('\\"Domestic\\": true')) {
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
