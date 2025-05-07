import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {catchError} from "rxjs/operators";
import {environment} from "../../../../environments/environment";
import {handleError} from "../../../helpers/error-helper";
import {debounceTime, Observable} from "rxjs";

const FRIENDS_API = `${environment.apiEndpoint}my-friends`;

@Injectable({
  providedIn: 'root'
})
export class MyFriendsService {

  constructor(
    private httpClient: HttpClient,
  ) { }

  addFriend(friend_id): Observable<any>{
    const body = {
      friend_id
    };
    return this.httpClient.post(`${FRIENDS_API}/request-friendship`, body);
  }

  inviteContact(displayName: string, phoneNumber: string): Observable<any>{
    const body = {
      phoneNumber,
      displayName
    };
    return this.httpClient.post(`${FRIENDS_API}/invite-contact`, body);
  }


  removeFriend(friendship_id: string): Observable<any>{
    const options = {
      body: {
        friendship_id
      }
    };

    return this.httpClient.delete( `${FRIENDS_API}`, options).pipe(
      catchError(handleError('myMeetUps')),
    );
  }

  blockFriend(friendshipId: string): Observable<any>{
    const body = {friend_id: friendshipId};
    return this.httpClient.post( `${FRIENDS_API}/block-friendship`, body).pipe(
      catchError(handleError('myMeetUps')),
    );
  }

  acceptFriend(friendId: string): Observable<any> {
    const body = {
      friend_id: friendId
    };
    return this.httpClient.post(`${FRIENDS_API}/accept-friendship`, body).pipe(
      catchError(handleError('acceptFriend')),
    );
  }

  getMyFriends(): Observable<any> {
    return this.httpClient.get(`${FRIENDS_API}/index`);
  }

  randomNearby(loc_x: number, loc_y: number): Observable<any> {
    const body = {
      loc_x, loc_y
    };

    return this.httpClient.post(`${FRIENDS_API}/random-nearby`, body).pipe(
      catchError(handleError('randomNearby')),
    );
  }


  searchForFriends(search_string): Observable<any> {
    const body = {
      search_string
    };

    return this.httpClient.post(`${FRIENDS_API}/search-for-friends`, body).pipe(
      debounceTime(2500),
      catchError(handleError('randomNearby')),
    );
  }

  searchForUser(search_string): Observable<any> {
    const body = {
      search_string
    };

    return this.httpClient.post(`${FRIENDS_API}/search-for-user`, body).pipe(
      debounceTime(2500),
      catchError(handleError('randomNearby')),
    );
  }
}

export enum FRIENDSHIP_STATUS_E {
  PENDING = 0,
  ACCEPTED = 1,
  // DENIED = 2, instead we're just deleting off the table if they deny it. Users can choose to block someone when it
  // gets too annoying.
  BLOCKED = 3,
}
