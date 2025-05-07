import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {handleError} from '../../../helpers/error-helper';
import {Observable} from 'rxjs';
import * as rpxGlobals from '../../../globals';
import {catchError} from 'rxjs/operators';

const PULL_INFO_API = `${rpxGlobals.API}surroundings/pull-info-object`;
const PULL_INFO_EVENT_API = `${rpxGlobals.API}surroundings/get-event`;

@Injectable({
  providedIn: 'root',
})
export class InfoObjectServiceService {
  constructor(private http: HttpClient) {}

  pullInfoObject(infoObjRequest: any): Observable<any> {
    return this.http
      .post<any>(PULL_INFO_API, infoObjRequest)
      .pipe(catchError(handleError('pullInfoObject')));
  }

  pullEventObject(infoObjRequest: any): Observable<any> {
    return this.http
      .post<any>(PULL_INFO_EVENT_API, infoObjRequest)
      .pipe(catchError(handleError('pullEventObject')));
  }
}
