import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {handleError} from '../../helpers/error-helper';
import * as rpxGlobals from '../../globals';
import {catchError} from 'rxjs/operators';
import {Observable} from 'rxjs';

const USER_LOCATION_API = `${rpxGlobals.API}user-location`;
const SEARCH_BUSINESS_API = `${rpxGlobals.API}surroundings/search-businesses`;
const SB_COMMUNITY_MEMBERS_API = `${rpxGlobals.API}surroundings/get-community-members`;
const SEARCH_EVENTS_API = `${rpxGlobals.API}surroundings/search-events`;
const GET_CLASSIFICATIONS = `${rpxGlobals.API}surroundings/get-classifications`;

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  constructor(private http: HttpClient) {}

  getClassifications(): Observable<any> {
    const getClassificationsApi = `${GET_CLASSIFICATIONS}`;

    return this.http
      .get<any>(getClassificationsApi)
      .pipe(catchError(handleError('getClassifications')));
  }

  getEvents(searchObj: any): Observable<any> {
    const getEventsApi = `${SEARCH_EVENTS_API}`;

    return this.http
      .post<any>(getEventsApi, searchObj)
      .pipe(catchError(handleError('getEvents')));
  }

  getBusinesses(searchObj: any): Observable<any> {
    const getBusinessesApi = `${SEARCH_BUSINESS_API}`;

    return this.http
      .post<any>(getBusinessesApi, searchObj)
      .pipe(catchError(handleError('getBusinesses')));
  }

  getRpxCommunityMemberList(searchObj: any): Observable<any> {
    const getBusinessesApi = `${SB_COMMUNITY_MEMBERS_API}`;

    return this.http
      .post<any>(getBusinessesApi, searchObj)
      .pipe(catchError(handleError('getRpxCommunityMemberList')));
  }

  saveCurrentLocation(saveLocationObj: any) {
    const locationApi = `${USER_LOCATION_API}/save-current-location`;

    return this.http
      .post<any>(locationApi, saveLocationObj)
      .pipe(catchError(handleError('saveCurrentLocation Error')));
  }

  retrieveSurroudings(retrieveSurroundingsObj: any) {
    const locationApi = `${USER_LOCATION_API}/retrieve-surroundings`;

    return this.http
      .post<any>(locationApi, retrieveSurroundingsObj)
      .pipe(catchError(handleError('retrieveSurroudings Error')));
  }
}
