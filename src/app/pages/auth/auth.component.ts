import { Component } from '@angular/core';
import { Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { TranslateService } from '@ngx-translate/core';
import { NzModalService } from 'ng-zorro-antd/modal';

import { AuthApiService, IAuthSignInParams } from 'api/auth.api';
import { IUserCreateParams } from 'interfaces/userapi-query';
import { FormService } from 'services/form.service';
import { EAppRoutes, userRootRoute } from 'enums/routing';
import { StorageService } from 'services/storage.service';
import { DefaultParams } from 'components/defaults.component';

import { routeToUrl } from 'tools/route-to-url';
import { AppService } from 'services/app.service';

@Component({
    selector: 'app-auth',
    templateUrl: './auth.component.html',
    styleUrls: ['./auth.component.less'],
})
export class AuthComponent {
    readonly EAppRoutes = EAppRoutes;
    readonly routeToUrl = routeToUrl;

    readonly signInForm = this.formService.createFormManager<IAuthSignInParams>(
        {
            login: {
                validators: [Validators.required, Validators.maxLength(64)],
            },
            password: {
                validators: [
                    Validators.required,
                    Validators.minLength(8),
                    Validators.maxLength(64),
                ],
                errors: ['invalid_password', 'user_not_active', 'unknown'],
            },
        },
        {
            onSubmit: () => this.onSignIn(),
        },
    );

    readonly lostPassForm = this.formService.createFormManager<{ login: string }>(
        {
            login: {
                validators: [Validators.required, Validators.maxLength(64)],
                errors: [
                    'login_format_invalid',
                    'user_not_active',
                    'unknown_id',
                    'smtp_client_create_error',
                    'email_send_error',
                ],
            },
        },
        {
            onSubmit: () => this.onLostPassword(),
        },
    );

    readonly signUpForm = this.formService.createFormManager<IUserCreateParams>(
        {
            login: {
                validators: [Validators.required, Validators.maxLength(64)],
                errors: ['login_format_invalid', 'duplicate_login'],
            },
            publicname: {
                validators: [Validators.required, Validators.maxLength(256)],
            },
            password: {
                validators: [
                    Validators.required,
                    Validators.minLength(8),
                    Validators.maxLength(64),
                ],
                errors: ['password_format_invalid'],
            },
            email: {
                validators: [Validators.required, Validators.email],
                errors: [
                    'email_format_invalid',
                    'duplicate_email',
                    'smtp_client_create_error',
                    'email_send_error',
                    'unknown',
                ],
            },
        },
        {
            onSubmit: () => this.onSignUp(),
        },
    );

    submitting = false;

    constructor(
        private formService: FormService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private translateService: TranslateService,
        private nzModalService: NzModalService,
        private authApiService: AuthApiService,
        private appService: AppService,
        private storageService: StorageService,
    ) {
        this.signUpForm.formData.controls['publicname'].setValue(this.generateName());
    }

    onSignIn(): void {
        this.submitting = true;

        const params = this.signInForm.formData.value as IAuthSignInParams;

        this.authApiService.sigIn(params).subscribe(
            ({ sessionid, isReadOnly }) => {
                this.appService.authorize(sessionid, isReadOnly).subscribe(
                    () => {
                        const target =
                            (this.activatedRoute.snapshot.queryParams.to as string) ||
                            routeToUrl(userRootRoute);

                        this.storageService.currentUser = params.login;
                        this.router.navigate([target]);
                    },
                    () => {
                        this.signInForm.onError('unknown');

                        this.submitting = false;
                    },
                );
            },
            error => {
                this.signInForm.onError(error);

                this.submitting = false;
            },
        );
    }

    onSignUp(): void {
        this.submitting = true;

        let params = this.signUpForm.formData.value as IUserCreateParams;
        if (params.publicname === '') params.publicname = this.generateName();
        params['name'] = params.publicname;
        delete params.publicname;

        this.authApiService.signUp(params).subscribe(
            () => {
                this.nzModalService.success({
                    nzContent: this.translateService.instant('auth.signUp.success'),
                    nzOkText: this.translateService.instant('common.ok'),
                });

                this.router.navigate([routeToUrl(EAppRoutes.Home)]);
            },
            error => {
                this.signUpForm.onError(error);

                this.submitting = false;
            },
        );
    }

    private generateName() {
        let randI = Math.floor(Math.random() * DefaultParams.STATES.length);
        const state = DefaultParams.STATES[randI];
        randI = Math.floor(Math.random() * DefaultParams.ANIMALS.length);
        const animal = DefaultParams.ANIMALS[randI];
        return state + ' ' + animal;
    }
    genName() {
        this.signUpForm.formData.controls['publicname'].setValue(this.generateName());
    }
    onLostPassword(): void {
        this.submitting = true;

        const params = this.lostPassForm.formData.value;

        this.authApiService.changePWD(params).subscribe(
            () => {
                this.nzModalService.success({
                    nzContent: this.translateService.instant('auth.changePWD.success'),
                    nzOkText: this.translateService.instant('common.ok'),
                });

                this.router.navigate([routeToUrl(EAppRoutes.Home)]);
            },
            error => {
                this.signUpForm.onError(error);

                this.submitting = false;
            },
        );
    }
}
