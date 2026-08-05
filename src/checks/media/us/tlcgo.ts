import { C_FAIL, C_NA, C_UNL } from "@/lib/constants/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/lib/constants/text";
import { UA_WINDOWS } from "@/lib/constants/ua";

// @id: tlcgo
// @name: TLC GO
// @description: 检测 TLC GO 解锁状态
// @category: media
// @regions: us
// @tags: stream, video
// @priority: 45

// https://github.com/HsukqiLee/MediaUnlockTest/blob/main/pkg/providers/TLCGO.go
function handler(): HandlerResult {
  const response = fetch("https://atlas.ngtv.io/v2/locate", {
    headers: {
      "User-Agent": UA_WINDOWS,
      "app-id":
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuZXR3b3JrIjoiYWxsIiwicHJvZHVjdCI6InByaXNtIiwicGxhdGZvcm0iOiJ3ZWIiLCJhcHBJZCI6ImFsbC1wcmlzbS13ZWItNzI4aGtyIn0.4Fk4E28ffoFgCIcgNSG8xX5TP2n3PIU6c3jadumKULo",
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
    if (response.body.indexOf('"country": "US"') > -1) {
      return {
        text: T_UNL,
        background: C_UNL,
      };
    }
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
