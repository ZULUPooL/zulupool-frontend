import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';
import { not } from 'logical-not';

import { RestService } from 'services/rest.service';
import { IUser, IUserSettings } from 'interfaces/user';
import * as IApi from 'interfaces/userapi-query';

@Injectable({
    providedIn: 'root',
})
export class UserApiService {
    constructor(private restService: RestService) {}

    /*userChangePassword(data: IUserChangePasswordParams): Observable<any> {
        return this.restService.post("/userChangePassword", data);
    }
    userChangePasswordInitiate(data: IUserChangePasswordInitiateParams): Observable<any> {
        return this.restService.post("/userChangePasswordInitiate", data);
    } 
    createUser(user: IUserCreateParams): Observable<any> {
        return this.restService.post("/userCreate", user);
    }*/
    createUser(
        params: IApi.IUserCreateParams = {} as IApi.IUserCreateParams,
    ): Observable<IApi.IUserCreateResponse | null> {
        return this.restService.post('/userCreate', params);
    }
    userResendEmail(
        params: IApi.IUserResendEmailParams = {} as IApi.IUserResendEmailParams,
    ): Observable<IApi.IUserResendEmailResponse | null> {
        if (not(params.login) || not(params.password) || not(params.email)) return of(null);
        return this.restService.post('/userResendEmail', params);
    }
    userAction(
        params: IApi.IUserActionParams = {} as IApi.IUserActionParams,
    ): Observable<IApi.IUserActionResponse | null> {
        //if (not(params.id)) return of(null);
        return this.restService.post('/userAction', params);
    }
    userGetCredentials(
        params: IApi.IUserGetCredentialsParms = {} as IApi.IUserGetCredentialsParms,
    ): Observable<IApi.IUserGetCredentialsResponse | null> {
        //        if (not(params.id)) return of(null);
        return this.restService.post(`/userGetCredentials`, params);
    }
    userGetSettings(
        params: IApi.IUserGetSettingsParams = {} as IApi.IUserGetSettingsParams,
    ): Observable<IApi.IUserGetSettingsResponse | null> {
        //        if (not(params.id)) return of(null);
        return this.restService.post('/userGetSettings', params);
    }
    userUpdateSettings(
        params: IApi.IUserUpdateSettingsParams = {} as IApi.IUserUpdateSettingsParams,
    ): Observable<IApi.IUserUpdateSettingsResponse | null> {
        if (
            not(params.coin) ||
            not(params.address) ||
            not(params.payoutThreshold) ||
            not(params.autoPayoutEnabled)
        )
            return of(null);
        return this.restService.post('/userUpdateSettings', params);
    }

    queryProfitSwitchCoeff(params = {}): any {
        return this.restService.post('/backendQueryProfitSwitchCoeff', params);
    }

    updateProfitSwitchCoeff(params: { coin: string; profitSwitchCoeff: any }): Observable<void> {
        return this.restService.post('/backendUpdateProfitSwitchCoeff', params);
    }

    changePassword(params: IUserChangePassword): Observable<void> {
        return this.restService.post('/userChangePassword', params);
    }

    userEnumerateAll(
        params: IApi.IUserEnumerateAllParams = {} as IApi.IUserEnumerateAllParams,
    ): Observable<IApi.IUserEnumerateAllResponse | null> {
        return this.restService.post('/userEnumerateAll', params);
    }
}

export interface IAdminUserCreateParams {
    login: string;
    password: string;
    email: string;
    name: string;
    isActive?: boolean;
    isReadOnly?: boolean;
    id?: string;
}
export interface IUserCreateParams {
    login: string;
    password: string;
    email: string;
    // name: string;
}

export interface IUserResendEmailParams {
    login: string;
    password: string;
    email: string;
}

export interface IUserListResponse {
    users: IUser[];
}

export interface IUserGetSettings {
    coins: IUserSettings[];
}

export interface IUserChangePassword {
    newPassword: string;
}
