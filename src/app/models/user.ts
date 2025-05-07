import {RpxUser} from './rpxuser';
import {Business} from './business';

export class User {
  public id: number;
  public uuid: string;
  public username: string;
  public email: string;
  public trial_ends_at: string;
  public created_at: string;
  public updated_at: string;
  public rpx_user: RpxUser;
  public business: Business;

  constructor(user_object?: any) {}
}
