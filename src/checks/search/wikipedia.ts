import { C_FAIL, C_NA, C_UNK, C_UNL } from "@/lib/constants/colors";
import { M_RATE_LIMIT, T_ALLOW, T_BLOCK, T_FAIL, T_NA, T_UNK } from "@/lib/constants/text";
import { UA_WINDOWS } from "@/lib/constants/ua";

// @id: wikipedia
// @name: Wikipedia 编辑权限
// @description: 检测 Wikipedia 编辑权限是否已解锁
// @category: search
// @regions: global
// @tags: scholar
// @priority: 12

function handler(): HandlerResult {
  var content = fetch(
    "https://zh.wikipedia.org/w/index.php?title=Wikipedia%3A%E6%B2%99%E7%9B%92&action=edit",
    {
      headers: {
        "User-Agent": UA_WINDOWS,
      },
      noRedir: false,
      retry: 3,
      timeout: 5000,
    }
  );

  if (!content) {
    return {
      text: T_NA,
      background: C_NA,
    };
  }

  if (content.body.indexOf("Banned") > -1) {
    return {
      text: T_BLOCK,
      background: C_FAIL,
    };
  }
  if (content.statusCode === 200) {
    return {
      text: T_ALLOW,
      background: C_UNL,
    };
  }
  if (content.statusCode === 429) {
    return {
      text: `${T_FAIL}(${M_RATE_LIMIT})`,
      background: C_FAIL,
    };
  }
  return {
    text: T_UNK,
    background: C_UNK,
  };
}

export default handler;
