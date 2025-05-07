import {RpxUser} from "../../../../models/rpxuser";

export function normalizeProfile(profileList: RpxUser[], myUserId) {
  const normalizedProfileList = [];
  let user_profile;

  profileList.forEach((profile: any) => {
    if (profile.user_id === myUserId) {
      user_profile = profile.friend_profile;
    } else if (profile.friend_id === myUserId) {
      user_profile = profile.user_profile;
    }

    normalizedProfileList.push({
      ...profile,
      user_profile,
    });
  });

  return normalizedProfileList;
}

export function normalizeProfileFromFriendSearch(profileList: [], myUserId: number) {
  const normalizedProfileList = [];

  profileList.forEach((profile: any) => {
    let user_profile;
    if (myUserId === profile.user_id) {
      user_profile = profile.friend_rpx_profile;
      user_profile.rpx_user = profile.friend_rpx_profile;
    } else {
      user_profile = profile.rpx_profile;
      user_profile.rpx_user = profile.rpx_pofile;
    }

    normalizedProfileList.push({
      ...profile,
      user_profile,
    });
  });

  return normalizedProfileList;
}
