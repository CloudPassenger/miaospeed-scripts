// @id: discoveryplus-uk
// @name: Discovery+ UK
// @description: 检测 Discovery+ 英国站解锁状态
// @category: media
// @regions: uk
// @tags: stream, video
// @priority: 45

import { C_FAIL, C_NA, C_UNL } from "@/lib/constants/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/lib/constants/text";
import { UA_WINDOWS } from "@/lib/constants/ua";

// https://github.com/oneclickvirt/UnlockTests/blob/main/uk/DiscoveryPlus.go
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
    "https://disco-api.discoveryplus.co.uk/token?realm=questuk&deviceId=61ee588b07c4df08c02861ecc1366a592c4ad02d08e8228ecfee67501d98bf47&shortlived=true",
    {
      headers: {
        "User-Agent": UA_WINDOWS,
      },
      retry: 3,
      timeout: 5000,
    },
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

  const meResp = fetch("https://disco-api.discoveryplus.co.uk/users/me", {
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

  if (territory === "gb") {
    return {
      text: T_UNL,
      background: C_UNL,
    };
  }
  if (territory) {
    return {
      text: `${T_UNL}(${territory})`,
      background: C_UNL,
    };
  }

  return {
    text: T_NA,
    background: C_NA,
  };
}

export default handler;
