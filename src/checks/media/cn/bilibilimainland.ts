// @id: bilibilimainland
// @name: 哔哩哔哩大陆
// @description: 检测大陆限定内容 (api.bilibili.com) 是否可播放，适用于回国/中转节点场景
// @category: media
// @regions: cn
// @tags: stream, video
// @priority: 30

import { C_FAIL, C_NA, C_UNL } from "@/lib/constants/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/lib/constants/text";
import { UA_WINDOWS } from "@/lib/constants/ua";

// 参考:
// https://github.com/oneclickvirt/UnlockTests/blob/main/asia/BilibiliMainland.go
// https://github.com/clash-verge-rev/clash-verge-rev/blob/main/crates/clash-verge-media-unlock/src/bilibili.rs
type BilibiliResponse = {
  code: number;
};

function handler(): HandlerResult {
  const response = fetch(
    "https://api.bilibili.com/pgc/player/web/playurl?avid=82846771&qn=0&type=&otype=json&ep_id=307247&fourk=1&fnver=0&fnval=16&module=bangumi",
    {
      headers: {
        "User-Agent": UA_WINDOWS,
      },
      retry: 3,
      timeout: 5000,
    },
  );

  if (!response) {
    return {
      text: `${T_FAIL}(${M_NETWORK})`,
      background: C_FAIL,
    };
  }

  if (response.statusCode === 412) {
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  }

  if (response.body.indexOf("抱歉您所在地区不可观看") > -1 || response.body.indexOf("The area is inaccessible") > -1) {
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  }

  const res = safeParse<BilibiliResponse>(response.body);
  const code = get<number>(res, "code", NaN);

  if (code === 10004001 || code === 10003003 || code === -10403) {
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  }
  if (code === 0) {
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
