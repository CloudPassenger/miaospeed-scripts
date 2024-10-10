import { C_FAIL, C_NA, C_UNL } from "@/consts/colors";
import {
  M_NETWORK,
  M_RESPONSE,
  T_FAIL,
  T_UNK,
} from "@/consts/text";
import { UA_CURL, UA_WINDOWS } from "@/consts/ua";

// @name: 回墙出口
// @description: 检测回墙流量的出口，避免流量的统计学探测从而导致服务器被封锁
// @regions: global
// @tags: tools
// @priority: 5

interface ResponseBody {
  code: number;
  data: IpInfoData;
}

interface IpInfoData {
  ip: string;
  country: string;
  province: null;
  city: string;
  district: string;
  isp: null;
  operator: null;
  countryCode: string;
  lon: string;
  lat: string;
}

function handler(): HandlerResult {
  const response = fetch(`https://api-v3.speedtest.cn/ip`, {
    method: "GET",
    headers: {
      "User-Agent": UA_CURL,
    },
    noRedir: false,
    retry: 3,
    timeout: 15000,
  });

  if (!response || response.statusCode !== 200) {
    return {
      text: `${T_FAIL}(${M_NETWORK})`,
      background: C_FAIL,
    };
  }

  const body = response.body;
  const data = safeParse<ResponseBody>(body);

  if (data.code !== 0 || !data.data) {
    return {
      text: `${T_FAIL}(${M_RESPONSE})`,
      background: C_FAIL,
    };
  }

  const isp = data.data.isp || T_UNK;
  const city_name = data.data.city || T_UNK;
  const country_code = data.data.countryCode || T_UNK;

  return {
    text: `${isp} - ${city_name}, ${country_code}`,
    background: C_UNL,
  };
}

export default handler;
