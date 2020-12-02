import { Component, OnInit } from '@angular/core';
import { DefaultParams } from 'components/defaults.component';

import { UserApiService } from 'api/user.api';
import { IUser } from 'interfaces/user';
import { StorageService } from 'services/storage.service';
import { Router } from '@angular/router';
import { userRootRoute } from 'enums/routing';
import { ESuffix } from 'pipes/suffixify.pipe';

@Component({
    selector: 'app-users-page',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.less'],
})
export class UsersComponent implements OnInit {
    readonly ESuffix = ESuffix;
    users: IUser[];
    powerMultLog10: number = 6;

    get targetLogin(): string {
        return this.storageService.targetUser;
    }

    constructor(
        private router: Router,
        private userApiService: UserApiService,
        private storageService: StorageService,
    ) {}

    ngOnInit(): void {
        this.userApiService.userEnumerateAll().subscribe(({ users }) => {
            /*users = users.filter(function (item) {
                return (
                    item.login !== DefaultParams.ADMINNAME &&
                    item.login !== DefaultParams.GAZERNAME
                );
            });*/
            //            users.forEach(item => {
            //                item.lastShareTime = currentTime - item.lastShareTime;
            //            });
            const nullDate = (new Date(1).valueOf() / 1000) as any;
            const tNow = parseInt(((new Date().valueOf() / 1000) as any).toFixed(0));
            //debugger;
            users.forEach(item => {
                if (item.lastShareTime === 0) item.lastShareTime = parseInt(nullDate.toFixed(0));
                item.lastShareTime = tNow - item.lastShareTime;
                if (item.registrationDate > tNow) {
                    //default accounts
                    item.registrationDate = nullDate;
                    item.lastShareTime = 0;
                }
            });

            this.users = users;
        });
    }

    onUserClick(user: IUser): void {
        if (user.login !== this.targetLogin) {
            this.storageService.targetUser = user.login;
            //this.storageService.targetUserData = user;

            this.router.navigate([userRootRoute]);
        }
    }
}
