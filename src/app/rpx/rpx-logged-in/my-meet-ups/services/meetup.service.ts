import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../../environments/environment";
import {catchError, tap} from "rxjs/operators";
import {handleError} from "../../../../helpers/error-helper";
import {MeetUp, MeetUpInvitation} from "../models";

const MEETUP_API = `${environment.apiEndpoint}meet-ups`;

@Injectable({
  providedIn: 'root'
})
export class MeetupService {

  constructor(
    private httpClient: HttpClient
  ) { }

  myMeetUps(){
    return this.httpClient.get(`${MEETUP_API}/index`).pipe(
      catchError(handleError('myMeetUps')),
    );
  }

  createMeetUp(req){
    return this.httpClient.post(`${MEETUP_API}`, req).pipe(
      catchError(handleError('createMeetUp')),
    );
  }

  editMeetUp(req, meetUpId: MeetUp['id']){
    return this.httpClient.put(`${MEETUP_API}/${meetUpId}`, req).pipe(
      catchError(handleError('editMeetUp')),
    );
  }

  acceptInvitation(meetUpId: MeetUp['uuid']){
    return this.httpClient.put(`${MEETUP_API}/accept-invitation/${meetUpId}`, null).pipe(
      catchError(handleError('acceptInvitation')),
    );
  }

  deleteMeetUp(meetUp: MeetUp){
    const body = {
      meet_up_id: meetUp.id
    };
    return this.httpClient.delete( `${MEETUP_API}`, {
      body
    }).pipe(
      catchError(handleError('myMeetUps')),
    );
  }

  showMeetUpInvitation(meetUpId: MeetUpInvitation['uuid'], myId) {
    return this.httpClient.get(`${MEETUP_API}/invites/show/${meetUpId}`).pipe(
      catchError(handleError('myMeetUps')),
      tap(c => console.log("the invitation list ", c)),
    );
  }

  showMeetUp(meetUpId: MeetUp['uuid']) {
    const params = {
      meetUpUuid: meetUpId
    }
    return this.httpClient.get(`${MEETUP_API}/show}`, {
      params,
    }).pipe(
      catchError(handleError('myMeetUps')),
    );
  }
}
