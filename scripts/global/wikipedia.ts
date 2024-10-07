import { C_FAIL, C_NA, C_UNK, C_UNL } from "@/consts/colors";
import { T_ALLOW, T_BLOCK, T_DENY, T_NA, T_PASS, T_UNK } from "@/consts/text";
import { UA_WINDOWS } from "@/consts/ua";

// @name: Wikipedia 编辑权限
// @description: 检测 Wikipedia 编辑权限是否已解锁
// @regions: global
// @tags: scholar
// @priority: 12

function handler(): HandlerResult {
  var content = fetch(
    "https://en.wikipedia.org/w/index.php?title=Wikipedia:WikiProject_on_open_proxies&action=edit",
    {
      headers: {
        UA_WINDOWS,
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
  } else if (content.statusCode === 200) {
    var resData = content.body; // 假设您可以同步获取响应体
    var index = resData.indexOf("This IP address has been"); // 使用indexOf来检查字符串
    if (index > -1) {
      return {
        text: T_BLOCK,
        background: C_FAIL,
      };
    } else {
      return {
        text: T_ALLOW,
        background: C_UNL,
      };
    }
  } else {
    return {
      text: T_UNK,
      background: C_UNK,
    };
  }
}

export default handler;
