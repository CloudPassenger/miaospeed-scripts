import { C_FAIL, C_NA, C_UNL } from "@/consts/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/consts/text";
import { UA_WINDOWS } from "@/consts/ua";

// @id: discoveryplus-us
// @name: Discovery+
// @description: 检测 Discovery+ 美国站解锁状态
// @category: media
// @regions: us
// @tags: stream, video
// @priority: 45

// https://github.com/HsukqiLee/MediaUnlockTest/blob/main/pkg/providers/DiscoveryPlus.go
// 采用动态获取 token 的方式，避免依赖硬编码且易过期的 Cookie
type DiscoveryTokenResponse = {
  data: {
    attributes: {
      token: string;
    };
  };
};

type DiscoveryMeResponse = {
  data: {
    attributes: {
      currentLocationTerritory: string;
    };
  };
};

function handler(): HandlerResult {
  const tokenResp = fetch(
    "https://us1-prod-direct.discoveryplus.com/token?deviceId=d1a4a5d25212400d1e6985984604d740&realm=go&shortlived=true",
    {
      headers: {
        "User-Agent": UA_WINDOWS,
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

  const tokenRes = safeParse<DiscoveryTokenResponse>(tokenResp.body);
  const token = get<string>(tokenRes, "data.attributes.token", "");

  if (!token) {
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  }

  const meResp = fetch("https://us1-prod-direct.discoveryplus.com/users/me", {
    headers: {
      "User-Agent": UA_WINDOWS,
      Cookie: `st=${token}`,
    },
    retry: 3,
    timeout: 5000,
  });

  if (!meResp) {
    return {
      text: `${T_FAIL}(${M_NETWORK})`,
      background: C_FAIL,
    };
  }

  const meRes = safeParse<DiscoveryMeResponse>(meResp.body);
  const territory = get<string>(meRes, "data.attributes.currentLocationTerritory", "");

  if (territory === "us") {
    return {
      text: T_UNL,
      background: C_UNL,
    };
  }
  if (territory) {
    return {
      text: `${T_FAIL}(${territory})`,
      background: C_FAIL,
    };
  }

  return {
    text: T_NA,
    background: C_NA,
  };
}

export default handler;
