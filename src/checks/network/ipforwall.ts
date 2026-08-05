import { C_FAIL, C_UNL } from "@/lib/constants/colors";
import {
  M_NETWORK,
  M_RESPONSE,
  T_FAIL,
  T_UNK,
} from "@/lib/constants/text";
import { UA_WINDOWS } from "@/lib/constants/ua";

// @id: ipforwall
// @name: 回墙出口
// @description: 检测访问中国大陆服务时使用的出口 IP
// @category: network
// @regions: global
// @tags: ip, tool
// @priority: 5

interface ResponseBody {
  code?: number;
  data?: IpInfoData;
}

interface IpInfoData {
  addr?: string;
  country?: string;
  province?: string;
  city?: string;
  isp?: string;
}

function handler(): HandlerResult {
  const response = fetch("https://api.bilibili.com/x/web-interface/zone", {
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
    };
  }

  const data = safeParse<ResponseBody>(response.body);

  if (data?.code !== 0 || !data.data?.addr) {
    return {
      text: `${T_FAIL}(${M_RESPONSE})`,
      background: C_FAIL,
    };
  }

  const locationParts: string[] = [];
  const locations = [data.data.country, data.data.province, data.data.city];
  locations.forEach((location) => {
    if (location && locationParts.indexOf(location) === -1) {
      locationParts.push(location);
    }
  });

  const isp = data.data.isp || T_UNK;
  const location = locationParts.length > 0 ? locationParts.join(", ") : T_UNK;

  return {
    text: `${data.data.addr} - ${isp} - ${location}`,
    background: C_UNL,
  };
}

export default handler;
