import { C_FAIL, C_UNL } from "@/lib/constants/colors";
import { M_NETWORK, T_FAIL, T_UNL } from "@/lib/constants/text";
import { UA_WINDOWS } from "@/lib/constants/ua";

// @id: litv
// @name: LiTV
// @description: 检测 LiTV 解锁状态
// @category: media
// @regions: tw
// @tags: stream, video, live
// @priority: 36

interface DeviceIdResponse {
  deviceId?: string;
}

interface RpcResponse {
  result?: {
    data?: {
      content_id?: string;
    };
  };
  error?: {
    code?: number;
    message?: string;
  };
}

function handler(): HandlerResult {
  const deviceResponse = fetch("https://www.litv.tv/api/generate-device-id", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://www.litv.tv",
      Referer: "https://www.litv.tv/",
      "User-Agent": UA_WINDOWS,
    },
    retry: 3,
    timeout: 15000,
  });

  if (!deviceResponse || deviceResponse.statusCode !== 200) {
    return {
      text: `${T_FAIL}(${M_NETWORK})`,
      background: C_FAIL,
    };
  }

  const deviceData = safeParse<DeviceIdResponse>(deviceResponse.body);
  const deviceId = deviceData.deviceId || "";
  if (!deviceId) {
    return {
      text: `${T_FAIL}(${M_NETWORK})`,
      background: C_FAIL,
    };
  }

  const payload = JSON.stringify({
    jsonrpc: "2.0",
    id: 0,
    method: "CCCService.GetProgramInformation",
    params: {
      version: "2.0",
      project_num: "LTWEB02",
      device_id: deviceId,
      swver: "LTWEB0210000WEB20190612185813",
      content_id: "VOD00328856",
      content_type: "drama",
    },
  });

  const response = fetch("https://proxy.svc.litv.tv/cdi/v2/rpc", {
    method: "POST",
    body: payload,
    headers: {
      "Content-Type": "application/json",
      Origin: "https://www.litv.tv",
      Referer: "https://www.litv.tv/drama/watch/VOD00328856",
      "User-Agent": UA_WINDOWS,
    },
    retry: 3,
    timeout: 15000,
  });

  if (!response || response.statusCode !== 200) {
    return {
      text: `${T_FAIL}(${M_NETWORK})`,
      background: C_FAIL,
    };
  }

  const data = safeParse<RpcResponse>(response.body);

  if (data.error) {
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  }

  const contentId = get<string>(data, "result.data.content_id");
  if (contentId) {
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

export default handler;
