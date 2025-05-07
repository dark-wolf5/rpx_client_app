import {Business} from "../../../../models/business";
import {RpxUser} from "../../../../models/rpxuser";
import {User} from "../../../../models/user";
import {format, formatISO} from "date-fns";
import {rpx_UTC} from "../../../../helpers/time";
import {Capacitor} from "@capacitor/core";
import {InfoObject} from "../../../../models/info-object";

export interface MeetUpInvitation {
  id: number
  uuid: string
  user_id: number
  business_id: any
  time: string | Date
  time_friendly: string | Date
  deleted_at: any
  created_at: string
  updated_at: string
  friend_list: string
  business_id_sb: number
  friend_id: number | string;
  meet_up_id: number
  going: number
  business: Business
  friend_profile: RpxUser;
  owner_profile: RpxUser;
  user_profile;
  meet_up: MeetUp;
}

export interface MeetUp {
  id: number
  uuid: string
  user_id: number
  business_id: any
  time: string;
  time_friendly: string;
  deleted_at: any
  created_at: string
  updated_at: string
  friend_list: string
  business_id_sb: number
  friend_id: number
  meet_up_id: number
  going: number
  business: Business | InfoObject
  name: string
  description: string
  invitation_list: MeetUpInvitation[];
  owner: User;
  contact_list: {name: string, number: string, image: string}[];
}

export function normalizeMeetUpList(meetUpList: MeetUpInvitation[]): MeetUp[] {
  return meetUpList.map(a => {
    const s = rpxToLocalTime(a.meet_up.time);

    return {
      ...a.meet_up,
      time_friendly: s.localTime,
      time: s.toISO,
    };
  });
}

export function rpxToLocalTime(a) {
  const localTime = format(
    `${rpx_UTC(a)}`,
    "LLL. dd ''yy h:mm a"
  );

  // You need ISO standard for Ion-datetime
  let toISO;
  if (Capacitor.getPlatform() === 'ios') {
    toISO = formatISO(rpx_UTC(a));
  } else {
    toISO = formatISO(`${rpx_UTC(a)}`);
  }

  return {toISO, localTime};
}
