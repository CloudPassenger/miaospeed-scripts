// @id: ipquality-v6
// @name: IP质量(v6)
// @description: 检测出口节点的 IPv6 地址、运营商、位置与线路质量
// @category: network
// @regions: global
// @tags: ip, quality, tool
// @priority: 3

import { queryIpQuality } from "@/lib/ipQuality";

function handler(): HandlerResult {
  return queryIpQuality("6");
}

export default handler;
