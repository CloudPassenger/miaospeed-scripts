import { C_FAIL, C_NA, C_UNL } from "@/consts/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/consts/text";
import { UA_WINDOWS } from "@/consts/ua";

// @id: eurosportro
// @name: Eurosport 罗马尼亚
// @description: 检测 Eurosport 罗马尼亚站解锁状态
// @category: media
// @regions: eu
// @tags: stream, live
// @priority: 45

// https://github.com/HsukqiLee/MediaUnlockTest/blob/main/pkg/providers/EurosportRO.go
type EurosportTokenResponse = {
  data: {
    attributes: {
      token: string;
    };
  };
};

function handler(): HandlerResult {
  const deviceId = `${Date.now()}-device`;

  const tokenResp = fetch(
    "https://eu3-prod-direct.eurosport.ro/token?realm=eurosport",
    {
      headers: {
        "User-Agent": UA_WINDOWS,
        Origin: "https://www.eurosport.ro",
        Referer: "https://www.eurosport.ro/",
        "x-device-info": `escom/0.295.1 (unknown/unknown; Windows/10; ${deviceId})`,
        "x-disco-client": "WEB:UNKNOWN:escom:0.295.1",
      },
      retry: 3,
      timeout: 5000,
    }
  );

  if (!tokenResp) {
    return {
      text: `${T_FAIL}(${M_NETWORK})`,
      background: C_FAIL,
    };
  }

  const tokenRes = safeParse<EurosportTokenResponse>(tokenResp.body);
  const token = get<string>(tokenRes, "data.attributes.token", "");

  if (!token) {
    return {
      text: T_NA,
      background: C_NA,
    };
  }

  const playbackResp = fetch(
    "https://eu3-prod-direct.eurosport.ro/playback/v2/videoPlaybackInfo/sourceSystemId/eurosport-vid2133403?usePreAuth=true",
    {
      headers: {
        "User-Agent": UA_WINDOWS,
        Authorization: `Bearer ${token}`,
      },
      retry: 3,
      timeout: 5000,
    }
  );

  if (!playbackResp) {
    return {
      text: `${T_FAIL}(${M_NETWORK})`,
      background: C_FAIL,
    };
  }

  if (playbackResp.body.indexOf("access.denied.geoblocked") > -1) {
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  }
  if (playbackResp.body.indexOf("eurosport-vod") > -1) {
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
