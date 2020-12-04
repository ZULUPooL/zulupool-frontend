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

    isReady: boolean;

    usersKeys = [
        'login',
        'email',
        'registrationDate',
        'workers',
        'shareRate',
        'power',
        'lastShareTime',
    ];
    usersMKeys = ['loginM', 'workers', 'power', 'lastShareTime'];

    users: IUser[];
    userItem: IUser;
    usersReady: boolean;

    powerMultLog10: number = 6;
    longAgo: boolean;

    get targetLogin(): string {
        return this.storageService.targetUser;
    }

    constructor(
        private router: Router,
        private userApiService: UserApiService,
        private storageService: StorageService,
    ) {}

    ngOnInit(): void {
        this.isReady = false;
        this.userApiService.userEnumerateAll().subscribe(({ users }) => {
            this.longAgo = false;
            /*users = users.filter(function (item) {
                return (
                    item.login !== DefaultParams.ADMINNAME &&
                    item.login !== DefaultParams.GAZERNAME
                );
            });*/
            //            users.forEach(item => {
            //                item.lastShareTime = currentTime - item.lastShareTime;
            //            });
            const nullDate = (new Date().setHours(0, 0, 0, 0).valueOf() / 1000 - 86400) as any;
            const tNow = parseInt(((new Date().valueOf() / 1000) as any).toFixed(0));
            users.forEach(item => {
                if (item.lastShareTime < nullDate) item['longAgo'] = true;
                if (
                    item.login === DefaultParams.ADMINNAME ||
                    item.login === DefaultParams.GAZERNAME
                ) {
                    item['longAgo'] = true;
                    item.registrationDate = 1577836800;
                }
                item.lastShareTime = tNow - item.lastShareTime;
            });
            this.users = users;
            this.isReady = true;
        });
    }

    onUserClick(user: IUser): void {
        if (user.login !== this.targetLogin) {
            this.storageService.targetUser = user.login;
            this.router.navigate([userRootRoute]);
        }
    }
}
