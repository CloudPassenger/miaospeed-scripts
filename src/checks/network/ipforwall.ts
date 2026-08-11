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
  code?: number;
  data?: IpInfoData;
}

interface IpInfoData {
  addr?: string;
  country?: string;
  province?: string;
  city?: string;
  isp?: string;
  latitude?: number;
  longitude?: number;
  country_code?: number;
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
      status: S_FAIL,
      error: M_NETWORK,
    };
  }

  const data = safeParse<ResponseBody>(response.body);

  if (data?.code !== 0 || !data.data?.addr) {
    return {
      text: `${T_FAIL}(${M_RESPONSE})`,
      background: C_FAIL,
      status: S_FAIL,
      error: M_RESPONSE,
    };
  }

  const country = data.data.country || T_UNK;
  const province = data.data.province || T_UNK;
  const city = data.data.city || T_UNK;
  const locationParts: string[] = [];
  const locations = [data.data.country, data.data.province, data.data.city];
  locations.forEach((location) => {
    if (location && locationParts.indexOf(location) === -1) {
      locationParts.push(location);
    }
  });

  const isp = data.data.isp || T_UNK;
  const location = locationParts.length > 0 ? locationParts.join(", ") : T_UNK;
  const extra: ExtraField[] = [
    { key: "ip", label: "IP地址", value: data.data.addr, type: "string" },
    { key: "isp", label: "运营商", value: isp, type: "string" },
    { key: "location", label: "位置", value: location, type: "string" },
    { key: "country", label: "国家/地区", value: country, type: "string" },
    { key: "province", label: "省份", value: province, type: "string" },
    { key: "city", label: "城市", value: city, type: "string" },
  ];

  if (typeof data.data.country_code === "number") {
    extra.push({ key: "countryCode", label: "国家/地区代码", value: data.data.country_code, type: "number" });
  }
  if (typeof data.data.latitude === "number") {
    extra.push({ key: "latitude", label: "纬度", value: data.data.latitude, type: "number" });
  }
  if (typeof data.data.longitude === "number") {
    extra.push({ key: "longitude", label: "经度", value: data.data.longitude, type: "number" });
  }

  return {
    text: `${data.data.addr} - ${isp} - ${location}`,
    background: C_UNL,
    status: S_UNL,
    extra,
  };
}

export default handler;
