import { C_FAIL, C_UNL } from "@/consts/colors";
import { M_NETWORK, M_TOKEN, T_FAIL, T_UNL } from "@/consts/text";
import { UA_WINDOWS } from "@/consts/ua";

import { SHA1 } from "jshashes";

// @name: Naver TV
// @description: 检测 Naver TV 的解锁状态
// @regions: kr
// @tags: stream, ott
// @priority: 50

/** Type */
export interface ResponseBody {
  statusCode?: "SUCCESS";
  errorCode?: string;
  result?: Result;
  statusMessage: string;
  errorMessage: string;
}

export interface Result {
  clip: Clip;
  channel: Channel;
  chatReplay: ChatReplay;
  play: Play;
  advertisement: Advertisement;
  qoeParams: QoeParams;
  likeParams: LikeParams;
}

export interface Advertisement {
  gladParam: null;
  smrTrackingData: string;
}

export interface Channel {
  channelType: string;
  channelId: string;
  displayChannelId: string;
  channelName: string;
  description: string;
  channelEmblemImageUrl: string;
  channelRepresentImageUrl: string;
  channelUrl: string;
  subscriptionCount: number;
  originalCode: null;
  channelLogo: null;
  brandCode: string;
  channelEmblem: string;
  exposure: boolean;
  representImageUrl: string;
  emblemImageUrl: string;
  title: string;
  subscription: boolean;
}

export interface ChatReplay {
  pool: null;
  ticket: null;
  objectId: null;
  templateId: null;
  startDateTime: null;
}

export interface Clip {
  episodeSequenceNo: null;
  episodeStartDateTime: null;
  scrapable: boolean;
  channelEmblem: string;
  episodeNo: null;
  adultVideo: boolean;
  channelRepresentImageUrl: string;
  recId: null;
  highlight: boolean;
  playTime: number;
  thumbnailImageUrl: string;
  playCount: number;
  globalService: boolean;
  channelCategoryName: null;
  clipTrailerUrl: ClipTrailerURL;
  channelEmblemImageUrl: string;
  channelLogo: string;
  shorts: boolean;
  trailerUrl: string;
  shareUrl: null;
  rankStatus: string;
  rankRange: string;
  orientation: string;
  commentCount: number;
  clipType: string;
  registerDateTime: string;
  description: string;
  title: string;
  hash: string;
  tags: string[];
  channelType: string;
  brandCode: null;
  optionFields: OptionField[];
  displayPlayTime: string;
  airsSessionId: null;
  airsBypass: null;
  likeItCount: number;
  displayChannelId: string;
  opened: boolean;
  multiTrack: boolean;
  channelUrl: string;
  videoId: string;
  clipNo: number;
  channelName: string;
  authType: string;
  channelId: string;
  firstExposureDatetime: string;
  smr: boolean;
}

export interface ClipTrailerURL {
  mp4: string;
  gif: string;
}

export interface OptionField {
  title: string;
  description: string;
}

export interface LikeParams {
  serviceId: string;
  displayId: string;
  contentsId: number;
}

export interface Play {
  inKey: string;
  playable: string;
}

export interface QoeParams {
  serviceTrackingId: string;
  serviceContentId: string;
}

/** Handler */

function handler(): HandlerResult {
  const timestamp = Date.now();
  const signature = new SHA1().b64_hmac(
    "nbxvs5nwNG9QKEWK0ADjYA4JZoujF4gHcIwvoCxFTPAeamq5eemvt5IWAYXxrbYM",
    `https://apis.naver.com/now_web2/now_web_api/v1/clips/31030608/play-info${timestamp}`
  );

  println("[Naver TV] timestamp: " + timestamp);
  println("[Naver TV] signature: " + signature);

  const requestUrl = `https://apis.naver.com/now_web2/now_web_api/v1/clips/31030608/play-info?msgpad=${timestamp}&md=${encodeURIComponent(
    signature
  )}`;

  println("[Naver TV] requestUrl: " + requestUrl);

  const response = fetch(requestUrl, {
    method: "GET",
    headers: {
      Connection: "keep-alive",
      Accept: "application/json, text/plain, */*",
      Origin: "https://tv.naver.com",
      Referer: "https://tv.naver.com/v/31030608",
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

  const body = response.body;
  const data = safeParse<ResponseBody>(body);

  println("[Naver TV] Result\n" + JSON.stringify(data));

  // Hmac error
  if (!data.result || !data.statusCode) {
    return {
      text: `${T_FAIL}(${M_TOKEN})`,
      background: C_FAIL,
    };
  } else if (data.result.play.playable === "PLAYABLE") {
    return {
      text: T_UNL,
      background: C_UNL,
    };
  } else {
    return {
      text: T_FAIL,
      background: C_FAIL,
    };
  }
}

export default handler;
