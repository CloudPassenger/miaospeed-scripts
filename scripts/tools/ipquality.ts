import { queryIpQuality } from "@/utils/ipQuality";

// @name: IP质量(v4)
// @description: 检测出口节点的 IPv4 地址、运营商、位置与线路质量
// @regions: global
// @tags: ip, quality, tool
// @priority: 2

function handler(): HandlerResult {
  return queryIpQuality("4");
}

export default handler;
