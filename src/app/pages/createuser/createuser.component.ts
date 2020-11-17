import { Component, OnInit } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { UserApiService } from "api/user.api";
import { IUserCreateByAdminParams } from "interfaces/userapi-query";

@Component({
    selector: "app-createuser",
    templateUrl: "./createuser.component.html",
    styleUrls: ["./createuser.component.less"],
})
export class CreateUserComponent implements OnInit {
    settingsItems: IUserCreateByAdminParams[];
    selectedIndex: number;

    form = this.formBuilder.group({
        login: [],
        password: [],
        email: [],
        name: [],
        isActive: [],
        isReadOnly: [],
    } as Record<keyof IUserCreateByAdminParams, any>);
    isSubmitting = false;

    constructor(
        private formBuilder: FormBuilder,
        private userApiService: UserApiService,
    ) {}

    ngOnInit(): void {}

    addUser(): void {
        this.isSubmitting = true;

        this.userApiService.createUser(this.form.value).subscribe(
            () => {
                this.isSubmitting = false;
            },
            () => {
                this.isSubmitting = false;
            },
        );
    }
}
