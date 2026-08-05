import { C_FAIL, C_NA, C_UNL } from "@/lib/constants/colors";
import { M_NETWORK, T_FAIL, T_NA, T_UNL } from "@/lib/constants/text";
import { UA_WINDOWS } from "@/lib/constants/ua";

// @id: skygo
// @name: Sky Go
// @description: 检测 Sky Go 英国站解锁状态
// @category: media
// @regions: uk
// @tags: stream, video
// @priority: 45

// https://github.com/oneclickvirt/UnlockTests/blob/main/uk/SkyGo.go
function handler(): HandlerResult {
  const response = fetch(
    "https://skyid.sky.com/authorise/skygo?response_type=token&client_id=sky&appearance=compact&redirect_uri=skygo://auth",
    {
      headers: {
        "User-Agent": UA_WINDOWS,
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

  if (
    response.body.indexOf("Sign in</h3>") > -1 ||
    response.body.indexOf("skygoSignin") > -1
  ) {
    return {
      text: T_UNL,
      background: C_UNL,
    };
  }
  if (
    response.body.indexOf("You don't have permission to access") > -1 ||
    response.body.indexOf("Access Denied") > -1 ||
    response.statusCode === 403 ||
    response.statusCode === 200
  ) {
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
