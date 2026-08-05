// @id: lemino
// @name: Lemino
// @description: 检测 Lemino (原 docomo anime store) 解锁状态
// @category: media
// @regions: jp
// @tags: stream, video
// @priority: 41

import { C_FAIL, C_NA, C_UNL } from "@/lib/constants/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/lib/constants/text";
import { UA_WINDOWS } from "@/lib/constants/ua";

// https://github.com/HsukqiLee/MediaUnlockTest/blob/main/pkg/providers/Lemino.go
function handler(): HandlerResult {
  const response = fetch("https://if.lemino.docomo.ne.jp/v1/user/delivery/watch/ready", {
    method: "POST",
    body: JSON.stringify({
      inflow_flows: [null, "crid://plala.iptvf.jp/group/b100ce3"],
      play_type: 1,
      key_download_only: null,
      quality: null,
      groupcast: null,
      avail_status: "1",
      terminal_type: 3,
      test_account: 0,
      content_list: [
        {
          kind: "main",
          service_id: null,
          cid: "00lm78dz30",
          lid: "a0lsa6kum1",
          crid: "crid://plala.iptvf.jp/vod/0000000000_00lm78dymn",
          preview: 0,
          trailer: 0,
          auto_play: 0,
          stop_position: 0,
        },
      ],
    }),
    headers: {
      "User-Agent": UA_WINDOWS,
      "Content-Type": "application/json",
      "x-service-token": "f365771afd91452fa279863f240c233d",
      "x-trace-id": "556db33f-d739-4a82-84df-dd509a8aa179",
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

  if (response.statusCode === 200) {
    return {
      text: T_UNL,
      background: C_UNL,
    };
  }
  if (response.statusCode === 403) {
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
