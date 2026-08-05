import { C_FAIL, C_NA, C_UNL, C_WARN } from "@/consts/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/consts/text";
import { UA_WINDOWS } from "@/consts/ua";

// @id: rakutentv-eu
// @name: Rakuten TV 欧洲
// @description: 检测 Rakuten TV 欧洲站解锁状态
// @category: media
// @regions: eu
// @tags: stream, video
// @priority: 45

// https://github.com/HsukqiLee/MediaUnlockTest/blob/main/pkg/providers/RakutenTV.go
function handler(): HandlerResult {
  const response = fetch(
    "https://gizmo.rakuten.tv/v3/me/start?device_identifier=web&device_stream_audio_quality=2.0&device_stream_hdr_type=NONE&device_stream_video_quality=FHD",
    {
      method: "POST",
      body: JSON.stringify({
        device_identifier: "web",
        device_metadata: {
          app_version: "v5.5.22",
          audio_quality: "2.0",
          brand: "chrome",
          firmware: "XX.XX.XX",
          hdr: false,
          model: "GENERIC",
          os: "Android OS",
          sdk: "112.0.0",
          serial_number: "not implemented",
          trusted_uid: false,
          uid: "ab0dd3e8-5cae-4ad2-ba86-97af867e75c3",
          video_quality: "FHD",
          year: 1970,
        },
        ifa_id: "b9c55e58-d5d0-41ed-becb-a54499731531",
      }),
      headers: {
        "User-Agent": UA_WINDOWS,
        "Content-Type": "application/json",
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

  if (response.statusCode === 406) {
    return {
      text: `${T_FAIL}(WAF)`,
      background: C_WARN,
    };
  }
  if (response.statusCode === 200) {
    return {
      text: T_UNL,
      background: C_UNL,
    };
  }

  if (response.body.indexOf("forbidden_market") > -1) {
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  }
  if (response.body.indexOf("forbidden_vpn") > -1) {
    return {
      text: `${T_FAIL}(VPN)`,
      background: C_FAIL,
    };
  }

  return {
    text: T_NA,
    background: C_NA,
  };
}

export default handler;
