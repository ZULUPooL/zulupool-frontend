import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EAppRoutes, authRoute } from 'enums/routing';
import { Router } from '@angular/router';

import { Observable } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';

import { StorageService } from 'services/storage.service';

import { not } from 'logical-not';

export const OKStatus = 'ok';

export interface IResponse {
    status?: string;
}

export class InvalidDataError extends Error {}

@Injectable({
    providedIn: 'root',
})
export class RestService {
    readonly headers: { [header: string]: string } = {
        accept: 'application/json',
        'Content-Type': 'application/json',
    };
    readonly EAppRoutes = EAppRoutes;

    constructor(
        private http: HttpClient,
        private storageService: StorageService,
        private router: Router,
    ) {}

    post<T>(url: string, params: any = {}): Observable<T> {
        const options = { headers: this.headers };
        const tmpUrl = url;
        params = { id: this.storageService.sessionId, ...params };

        if (not(params.id)) {
            delete params.id;
        }

        const { targetUser } = this.storageService;

        if (targetUser && tmpUrl !== '/backendUpdateProfitSwitchCoeff') {
            params.targetLogin = targetUser;
        }

        return this.http.post(createAPIUrl(url), params, options).pipe(
            catchError(error => {
                throw error;
            }),
            tap(response => {
                const { status } = response as IResponse;
                if (status === 'unknown_id' && tmpUrl !== '/userEnumerateAll') {
                    this.storageService.sessionId = null;
                    this.storageService.targetUser = null;
                    this.storageService.activeUserData = null;
                    this.storageService.isReadOnly = null;
                    this.router.navigate([authRoute]);
                    throw new InvalidDataError(status);
                } else if (tmpUrl === '/backendQueryProfitSwitchCoeff') {
                    response['status'] = 'ok';
                } else if (status !== OKStatus) throw new InvalidDataError(status);
            }),
            map(response => {
                delete (response as IResponse).status;
                return response as T;
            }),
        ) as Observable<T>;
    }
}

export function createAPIUrl(url: string): string {
    return `/api${url}`;
}
