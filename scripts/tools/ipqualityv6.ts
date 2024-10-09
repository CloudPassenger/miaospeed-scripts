import { C_FAIL, C_NA, C_UNL } from "@/consts/colors";
import { M_NETWORK, T_FAIL, T_NA } from "@/consts/text";
import { SEC_CH_UA, UA_CURL, UA_WINDOWS } from "@/consts/ua";

// @name: IP质量(V6)
// @description: 检测出口节点的 IPv6 质量
// @regions: global
// @tags: ip, quality, tool
// @priority: 3

/** Types */
interface IP2LocationResult {
  ip: string;
  country_code: string;
  country_name: string;
  region_name: string;
  district: string;
  city_name: string;
  latitude: number;
  longitude: number;
  zip_code: string;
  time_zone: string;
  asn: string;
  as: string;
  isp: string;
  domain: string;
  net_speed: string;
  idd_code: string;
  area_code: string;
  weather_station_code: string;
  weather_station_name: string;
  mcc: string;
  mnc: string;
  mobile_brand: string;
  elevation: number;
  usage_type: string;
  address_type: string;
  ads_category: string;
  ads_category_name: string;
  continent: Continent;
  country: Country;
  region: Continent;
  city: City;
  time_zone_info: TimeZoneInfo;
  geotargeting: Geotargeting;
  is_proxy: boolean;
  proxy: Proxy;
}

interface City {
  name: string;
  translation: Translation;
}

interface Translation {
  lang: null;
  value: null;
}

interface Continent {
  name: string;
  code: string;
  hemisphere?: string[];
  translation: Translation;
}

interface Country {
  name: string;
  alpha3_code: string;
  numeric_code: number;
  demonym: string;
  flag: string;
  capital: string;
  total_area: number;
  population: number;
  currency: Currency;
  language: Language;
  tld: string;
  translation: Translation;
}

interface Currency {
  code: string;
  name: string;
  symbol: string;
}

interface Language {
  code: string;
  name: string;
}

interface Geotargeting {
  metro: null;
}

interface Proxy {
  last_seen: number;
  proxy_type: string;
  threat: string;
  provider: string;
  is_vpn: boolean;
  is_tor: boolean;
  is_data_center: boolean;
  is_public_proxy: boolean;
  is_web_proxy: boolean;
  is_web_crawler: boolean;
  is_residential_proxy: boolean;
  is_consumer_privacy_network: boolean;
  is_enterprise_private_network: boolean;
  is_spammer: boolean;
  is_scanner: boolean;
  is_botnet: boolean;
}

interface TimeZoneInfo {
  olson: string;
  current_time: Date;
  gmt_offset: number;
  is_dst: boolean;
  sunrise: string;
  sunset: string;
}

const IPV4_ENDPOINT = "http://ipv4.ip.sb";
const IPV6_ENDPOINT = "http://ipv6.ip.sb";

const ISP_TYPE = {
  COM: "商宽",
  DCH: "机房",
  EDU: "教育",
  GOV: "政府",
  ORG: "机构",
  MIL: "军队",
  LIB: "学术",
  CDN: "CDN",
  ISP: "家宽",
  MOB: "移动",
  SES: "爬虫",
  RSV: "保留",
  UNK: "未知",
} as const satisfies Record<string, string>;

function getPublicIp(protocol: "4" | "6" = "4"): string | null {
  const response = fetch(protocol === "6" ? IPV6_ENDPOINT : IPV4_ENDPOINT, {
    method: "GET",
    headers: {
      "User-Agent": UA_CURL,
    },
    noRedir: false,
    retry: 3,
    timeout: 15000,
  });

  if (!response || response.statusCode !== 200) {
    return null;
  }
  return response.body.replace(/(\n|\r)/gm, '').trim();
}

function handler(): HandlerResult {
  const ipv6 = getPublicIp("6");

  if (!ipv6) {
    return {
      text: `无IPv6`,
      background: C_NA,
    };
  }

  const ip2locationUrl = `https://www.ip2location.io/${ipv6}`;

  const response = fetch(ip2locationUrl, {
    method: "GET",
    headers: {
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "Accept-Language": "en-US,en;q=0.9",
      "Sec-CH-UA": SEC_CH_UA,
      "Sec-CH-UA-Mobile": "?0",
      "Sec-CH-UA-Platform": '"Windows"',
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Sec-Fetch-User": "?1",
      "Upgrade-Insecure-Requests": "1",
      "User-Agent": UA_WINDOWS,
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

  const codeRegex = /<code[^>]*>([\s\S]*?)<\/code>/g;
  // println(response.body); // Ensure to get the response body
  const body = response.body;
  const codeMatches = body.match(codeRegex);

  const codeBody = codeMatches
    ? codeMatches[0].replace(/<\/?code[^>]*>/g, "").trim()
    : "{}";

  // println(codeBody);

  // Parse the JSON string
  const data = safeParse<IP2LocationResult>(codeBody);

  const country_code = data.country_code;
  const city_name = data.city_name;
  const asn = data.asn;
  const isp = data.isp;
  const usage_type = data.usage_type;
  const usage_types = usage_type && usage_type.length > 0 ? usage_type.split("/") : ['UNK'];
  const usage_type_text = usage_types
    .map((type) => ISP_TYPE[type] || type)
    .join("/");

  return {
    text: `${isp} (AS${asn}) - ${city_name}, ${country_code} - ${usage_type_text}`,
    background: C_UNL,
  };
}

export default handler;
