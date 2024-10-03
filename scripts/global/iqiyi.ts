import { C_NA, C_UNL, C_UNK } from "@/consts/colors";
import { T_NA, T_UNK, T_UNL } from "@/consts/text";
import { UA_WINDOWS } from "@/consts/ua";

function handler(): HandlerResult {
  const response = fetch("https://www.iq.com/?lang=en_us", {
    headers: {
      "User-Agent": UA_WINDOWS,
    },
    noRedir: false,
    retry: 3,
    timeout: 5000,
  });

  if (!response) {
    return {
      text: T_NA,
      background: C_NA,
    };
  } else if (response.statusCode == 200) {
    let info = response.body;
    var index = info.indexOf("intlPageInfo.pbInfos = {");
    if (index > 0) {
      var sinfo = info.substring(index, index + 110);
      var index2 = sinfo.indexOf("mod:");
      var sinfo2 = sinfo.substring(index2 + 98);
      var r = sinfo2.split('"');
      var region = r[0] ? r[0] : "NOT FOUND";
      if (region == "ntw") {
        region = "TW";
      } else if (region == "intl") {
        region = "国际";
      } else {
        region = region.toUpperCase();
      }
      return {
        text: `${T_UNL}(${region})`,
        background: C_UNL,
      };
    } else {
      return {
        text: T_UNK,
        background: C_UNK,
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