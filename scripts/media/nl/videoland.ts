import { C_FAIL, C_NA, C_UNL } from "@/consts/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/consts/text";
import { UA_WINDOWS } from "@/consts/ua";

// @id: videoland
// @name: Videoland
// @description: 检测 Videoland 解锁状态
// @category: media
// @regions: nl
// @tags: stream, video
// @priority: 45

// https://github.com/HsukqiLee/MediaUnlockTest/blob/main/pkg/providers/VideoLand.go
type VideoLandResponse = {
  data: {
    isOnboardingGeoBlocked: boolean;
  };
};

function handler(): HandlerResult {
  const response = fetch(
    "https://api.videoland.com/subscribe/videoland-account/graphql",
    {
      method: "POST",
      body: JSON.stringify({
        operationName: "IsOnboardingGeoBlocked",
        variables: {},
        query: "query IsOnboardingGeoBlocked {\n  isOnboardingGeoBlocked\n}\n",
      }),
      headers: {
        "User-Agent": UA_WINDOWS,
        "Content-Type": "application/json",
        Origin: "https://www.videoland.com",
        Referer: "https://www.videoland.com/",
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

  const res = safeParse<VideoLandResponse>(response.body);
  const blocked = get<boolean>(res, "data.isOnboardingGeoBlocked", null as any);

  if (blocked === null) {
    return {
      text: T_NA,
      background: C_NA,
    };
  }
  if (blocked) {
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  }

  return {
    text: T_UNL,
    background: C_UNL,
  };
}

export default handler;
