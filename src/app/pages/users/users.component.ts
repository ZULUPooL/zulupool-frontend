import { Component, OnInit } from '@angular/core';
import { DefaultParams } from 'components/defaults.component';

import { UserApiService } from 'api/user.api';
import { IUser } from 'interfaces/user';
import { StorageService } from 'services/storage.service';
import { Router } from '@angular/router';
import { EAppRoutes, userRootRoute } from 'enums/routing';
import { ESuffix } from 'pipes/suffixify.pipe';
import { TranslateService } from '@ngx-translate/core';

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
    listOfData: IUser[] = [];
    listOfCurrentPageData: IUser[] = [];
    listOfColumn = [];
    listOfMColumn = [];

    powerMultLog10: number = 6;
    longAgo: boolean;

    get targetLogin(): string {
        return this.storageService.targetUser;
    }

    constructor(
        private router: Router,
        private userApiService: UserApiService,
        private storageService: StorageService,
        private translateService: TranslateService,
    ) {
        this.listOfColumn = [
            {
                title: this.translateService.instant('users.usersTable.title.login'),
                compare: (a: IUser, b: IUser) => a.login.localeCompare(b.login),
                priority: 7,
            },
            {
                title: this.translateService.instant('users.usersTable.title.email'),
                compare: (a: IUser, b: IUser) => a.email.localeCompare(b.email),
                priority: 6,
            },
            {
                title: this.translateService.instant('users.usersTable.title.registrationDate'),
                compare: (a: IUser, b: IUser) => a.registrationDate - b.registrationDate,
                priority: 5,
            },
            {
                title: this.translateService.instant('users.usersTable.title.workers'),
                compare: (a: IUser, b: IUser) => a.workers - b.workers,
                priority: 4,
            },
            {
                title: this.translateService.instant('users.usersTable.title.shareRate'),
                compare: (a: IUser, b: IUser) => a.shareRate - b.shareRate,
                priority: 3,
            },
            {
                title: this.translateService.instant('users.usersTable.title.power'),
                compare: (a: IUser, b: IUser) => a.power - b.power,
                priority: 2,
            },
            {
                title: this.translateService.instant('users.usersTable.title.lastShareTime'),
                compare: (a: IUser, b: IUser) =>
                    parseInt(a.lastShareTime as any) - parseInt(b.lastShareTime as any),
                priority: 1,
            },
        ];

        this.listOfMColumn = [
            {
                title: this.translateService.instant('users.usersTable.title.loginM'),
                compare: (a: IUser, b: IUser) => a.login.localeCompare(b.login),
                priority: 4,
            },
            {
                title: this.translateService.instant('users.usersTable.title.workers'),
                compare: (a: IUser, b: IUser) => a.workers - b.workers,
                priority: 3,
            },
            {
                title: this.translateService.instant('users.usersTable.title.power'),
                compare: (a: IUser, b: IUser) => a.power - b.power,
                priority: 2,
            },
            {
                title: this.translateService.instant('users.usersTable.title.lastShareTime'),
                compare: (a: IUser, b: IUser) =>
                    parseInt(a.lastShareTime as any) - parseInt(b.lastShareTime as any),
                priority: 1,
            },
        ];
    }

    ngOnInit(): void {
        this.isReady = false;
        this.userApiService.userEnumerateAll({ id: this.storageService.sessionId, sortBy:'averagePower',size: 5000 }).subscribe(({ users }) => {
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
    onCurrentPageDataChange(listOfCurrentPageData: IUser[]): void {
        this.listOfCurrentPageData = listOfCurrentPageData;
        //        this.refreshCheckedStatus();
    }
    onUserClick(user: IUser): void {
        if (user.login !== this.targetLogin) {
            this.storageService.targetUser = user.login;
            //this.router.navigate([EAppRoutes.Users]);
        }
    }
    changeTarget(target: string) {}
}
