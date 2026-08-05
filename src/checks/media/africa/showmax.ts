import { C_FAIL, C_UNL } from "@/lib/constants/colors";
import { M_NETWORK, T_FAIL, T_UNL } from "@/lib/constants/text";
import { UA_WINDOWS } from "@/lib/constants/ua";

// @id: showmax
// @name: Showmax
// @description: 检测 Showmax 解锁状态
// @category: media
// @regions: africa
// @tags: stream, video
// @priority: 45

// https://github.com/oneclickvirt/UnlockTests/blob/main/africa/Showmax.go
function handler(): HandlerResult {
  const response = fetch("https://www.showmax.com/", {
    headers: {
      "User-Agent": UA_WINDOWS,
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

  const regionStart = response.body.indexOf("activeTerritory");
  if (regionStart === -1) {
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  }

  const rest = response.body.slice(regionStart + "activeTerritory".length + 1);
  const lineEnd = rest.indexOf("\n");
  const region = (lineEnd === -1 ? rest : rest.slice(0, lineEnd)).trim();

  if (region) {
    return {
      text: `${T_UNL}(${region.toLowerCase()})`,
      background: C_UNL,
    };
  }

  return {
    text: T_FAIL,
    background: C_FAIL,
  };
}

export default handler;
