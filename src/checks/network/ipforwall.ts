// @id: ipforwall
// @name: 回墙出口
// @description: 检测访问中国大陆服务时使用的出口 IP
// @category: network
// @regions: global
// @tags: ip, tool
// @priority: 5

import { C_FAIL, C_UNL } from "@/lib/constants/colors";
import { M_NETWORK, M_RESPONSE, T_FAIL, T_UNK } from "@/lib/constants/text";
import { UA_WINDOWS } from "@/lib/constants/ua";
import { S_FAIL, S_UNL } from "@/lib/constants/status";

interface ResponseBody {
  ret?: string;
  data?: IpInfoData;
}

interface IpInfoData {
  ip?: string;
  location?: string[];
}

function handler(): HandlerResult {
  const response = fetch("https://myip.ipip.net/json", {
    method: "GET",
    headers: {
      "User-Agent": UA_WINDOWS,
    },
    retry: 3,
    timeout: 15000,
  });

  if (!response || response.statusCode !== 200) {
    return {
      text: `${T_FAIL}(${M_NETWORK})`,
      background: C_FAIL,
      status: S_FAIL,
      error: M_NETWORK,
    };
  }

  const data = safeParse<ResponseBody>(response.body);

  if (data?.ret !== "ok" || !data.data?.ip) {
    return {
      text: `${T_FAIL}(${M_RESPONSE})`,
      background: C_FAIL,
      status: S_FAIL,
      error: M_RESPONSE,
    };
  }

  const locations = data.data.location || [];
  const country = locations[0] || T_UNK;
  const province = locations[1] || T_UNK;
  const city = locations[2] || T_UNK;
  const isp = locations[4] || T_UNK;
  const locationParts: string[] = [];
  [locations[0], locations[1], locations[2]].forEach((location) => {
    if (location && locationParts.indexOf(location) === -1) {
      locationParts.push(location);
    }
  });

  const location = locationParts.length > 0 ? locationParts.join(", ") : T_UNK;
  const extra: ExtraField[] = [
    { key: "ip", label: "IP地址", value: data.data.ip, type: "string" },
    { key: "isp", label: "运营商", value: isp, type: "string" },
    { key: "location", label: "位置", value: location, type: "string" },
    { key: "country", label: "国家/地区", value: country, type: "string" },
    { key: "province", label: "省份", value: province, type: "string" },
    { key: "city", label: "城市", value: city, type: "string" },
  ];

  return {
    text: `${data.data.ip} - ${isp} - ${location}`,
    background: C_UNL,
    status: S_UNL,
    extra,
  };
}

export default handler;
