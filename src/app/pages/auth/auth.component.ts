import { Component } from "@angular/core";
import { Validators } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";

import { TranslateService } from "@ngx-translate/core";
import { NzModalService } from "ng-zorro-antd/modal";

import { AuthApiService, IAuthSignInParams } from "api/auth.api";
import { IUserCreateParams } from "interfaces/userapi-query";
import { FormService } from "services/form.service";
import { EAppRoutes, userRootRoute } from "enums/routing";
import { userCreateResp } from "enums/api-enums";
import { StorageService } from "services/storage.service";

import { routeToUrl } from "tools/route-to-url";
import { AppService } from "services/app.service";

@Component({
    selector: "app-auth",
    templateUrl: "./auth.component.html",
    styleUrls: ["./auth.component.less"],
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
                errors: ["invalid_password", "user_not_active", "unknown"],
            },
        },
        {
            onSubmit: () => this.onSignIn(),
        },
    );

    readonly lostPassForm = this.formService.createFormManager<
        IAuthSignInParams
    >(
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
                errors: ["invalid_password", "user_not_active", "unknown"],
            },
        },
        {
            onSubmit: () => this.onSignIn(),
        },
    );

    readonly signUpForm = this.formService.createFormManager<IUserCreateParams>(
        {
            login: {
                validators: [Validators.required, Validators.maxLength(64)],
                errors: ["login_format_invalid", "duplicate_login"],
            },
            password: {
                validators: [
                    Validators.required,
                    Validators.minLength(8),
                    Validators.maxLength(64),
                ],
                errors: ["password_format_invalid"],
            },
            email: {
                validators: [Validators.required, Validators.email],
                errors: [
                    "email_format_invalid",
                    "duplicate_email",
                    "smtp_client_create_error",
                    "email_send_error",
                    "unknown",
                ],
            },
        },
        {
            onSubmit: () => this.onLostPassword(),
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
    ) {}

    onSignIn(): void {
        this.submitting = true;

        const params = this.signInForm.formData.value as IAuthSignInParams;

        this.authApiService.sigIn(params).subscribe(
            ({ sessionid }) => {
                this.appService.authorize(sessionid, true).subscribe(
                    () => {
                        const target =
                            (this.activatedRoute.snapshot.queryParams
                                .to as string) || routeToUrl(userRootRoute);

                        this.storageService.currentUser = params.login;
                        this.router.navigate([target]);
                    },
                    () => {
                        this.signInForm.onError("unknown");

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

        const params = this.signUpForm.formData.value as IUserCreateParams;

        this.authApiService.signUp(params).subscribe(
            () => {
                this.nzModalService.success({
                    nzContent: this.translateService.instant(
                        "auth.signIn.success",
                    ),
                    nzOkText: this.translateService.instant("common.ok"),
                });

                this.router.navigate([routeToUrl(EAppRoutes.Home)]);
            },
            error => {
                this.signUpForm.onError(error);

                this.submitting = false;
            },
        );
    }
    onLostPassword(): void {}
}
