import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError, tap, switchMap, filter, finalize } from 'rxjs/operators';
import { not } from 'logical-not';

import { UserApiService } from 'api/user.api';
import { AuthApiService } from 'api/auth.api';
import { IUser } from 'interfaces/user';
//import { TCoinName } from 'interfaces/coin';
import { StorageService } from 'services/storage.service';
import { IPoolCoinsItem } from 'interfaces/backend-query';
import { EUserRoles, EUsersState } from 'enums/role';
import * as IApi from 'interfaces/userapi-query';

const undefined = void 0;
const userStore = new BehaviorSubject<IUser | null>(undefined);
const coinStore = new BehaviorSubject<IPoolCoinsItem | null>(undefined);

@Injectable({
    providedIn: 'root',
})
export class AppService {
    readonly isReady = new BehaviorSubject<boolean>(false);
    readonly user = userStore.pipe(filter(value => value !== undefined));

    constructor(
        private userApiService: UserApiService,
        private authApiService: AuthApiService,
        private storageService: StorageService,
    ) {
        this.init();
    }

    authorize(sessionId: string, isReadOnly: boolean): Observable<void> {
        return this.userApiService.userGetCredentials({ id: sessionId }).pipe(
            switchMap<IApi.IUserGetCredentialsResponse, Observable<void>>(user => {
                this.storageService.sessionId = sessionId;
                this.storageService.isReadOnly = isReadOnly;
                //const state = isReadOnly ? EUsersState.ReadOnly : EUsersState.Regular;
                return this.userApiService.userEnumerateAll({ id: sessionId }).pipe(
                    map(({ users }) => {
                        const superUser =
                            users
                                .map(el => el.name)
                                .filter(el => el === 'admin' || el === 'observer').length > 0;
                        if (superUser) {
                            this.storageService.userType = 'admin';
                            userStore.next({
                                role: EUserRoles.Admin,
                                //state,
                                users,
                                ...user,
                            });
                            this.setUpTargetLogin(users);
                        } else {
                            this.storageService.userType = 'manger';
                            userStore.next({
                                role: EUserRoles.User,
                                //state,
                                ...user,
                            });
                        }
                    }),
                    catchError(() => {
                        this.storageService.userType = 'user';
                        userStore.next({
                            role: EUserRoles.User,
                            //state,
                            ...user,
                        });
                        this.storageService.targetUser = null;
                        return of(void 0);
                    }),
                );
            }),
            catchError(error => {
                this.reset();

                throw error;
            }),
        );
    }

    logOut(): Observable<void> {
        return this.authApiService.logOut().pipe(
            tap(() => {
                this.reset();
            }),
        );
    }

    getUser(): IUser | null {
        return userStore.value;
    }

    getCoin(): IPoolCoinsItem | null {
        return coinStore.value;
    }

    private init(): void {
        const initialSessionId = this.storageService.sessionId;
        const isReadOnly = this.storageService.isReadOnly;

        if (not(initialSessionId)) {
            userStore.next(null);

            this.isReady.next(true);
        } else {
            this.authorize(initialSessionId, isReadOnly)
                .pipe(
                    finalize(() => {
                        this.isReady.next(true);
                    }),
                )
                .subscribe();
        }
    }

    private setUpTargetLogin(users: IUser[]): void {
        const { targetUser } = this.storageService;

        if (targetUser && users.some(user => user.login === targetUser)) {
            return;
        }

        if (users.length > 0) {
            this.storageService.targetUser = users[0].login;
        }
    }

    private reset(): void {
        this.storageService.sessionId = null;
        this.storageService.isReadOnly = null;
        this.storageService.targetUser = null;
        userStore.next(null);
    }
}
