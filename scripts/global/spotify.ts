import { C_FAIL, C_NA, C_UNK, C_UNL } from "@/consts/colors";
import { T_ALLOW, T_BLOCK, T_DENY, T_FAIL, T_NA, T_PASS, T_UNK, T_UNL } from "@/consts/text";
import { UA_WINDOWS } from "@/consts/ua";

type ResponseBody = {
  status: number;
  country: string;
  can_accept_licenses_in_one_step: boolean;
  requires_marketing_opt_in: boolean;
  requires_marketing_opt_in_text: boolean;
  requires_tailored_ads_opt_in: boolean;
  minimum_age: number;
  country_group: string;
  specific_licenses: boolean;
  terms_conditions_acceptance: string;
  privacy_policy_acceptance: string;
  spotify_marketing_messages_option: string;
  pretick_eula: boolean;
  show_collect_personal_info: boolean;
  use_all_genders: boolean;
  use_other_gender: boolean;
  use_prefer_not_to_say_gender: boolean;
  show_non_required_fields_as_optional: boolean;
  date_endianness: number;
  is_country_launched: boolean;
  "push-notifications": boolean;
};

function handler(): HandlerResult {
  const response = fetch(
    "https://spclient.wg.spotify.com/signup/public/v1/account",
    {
      method: "POST",
      headers: {
        "User-Agent": UA_WINDOWS,
        "Accept-Language": "en",
      },
      body: "birth_day=23&birth_month=11&birth_year=2000&collect_personal_info=undefined&creation_flow=&creation_point=https%253A%252F%252Fwww.spotify.com%252Fhk-en%252F&displayname=Gay%2520Lord&gender=male&iagree=1&key=a1e486e2729f46d6bb368d6b2bcda326&platform=www&referrer=&send-email=0&thirdpartyemail=0&identifier_token=AgE6YTvEzkReHNfJpO114514",
      noRedir: false,
      retry: 3,
      timeout: 5000,
    }
  );

  if (!response) {
    return {
      text: T_NA,
      background: C_NA,
    };
  } else if (response.statusCode == 200) {
    const body = response.body;
    let data = safeParse<ResponseBody>(body);
    const status = data.status;
    const country = data.country;
    const is_country_launched = data.is_country_launched;

    if (status === 320 || status === 120) {
      return {
        text: T_FAIL,
        background: C_FAIL,
      };
    } else if (status === 311 && is_country_launched) {
      return {
        text: `${T_ALLOW}(${country})`,
        background: C_UNL,
      };
    } else {
      return {
        text: T_DENY,
        background: C_FAIL,
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
