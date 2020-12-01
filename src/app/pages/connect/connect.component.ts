import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { UserApiService } from 'api/user.api';
import { IUserSettings } from 'interfaces/user';
import { IInstanceItem } from 'interfaces/backend-query';
import { StorageService } from 'services/storage.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TranslateService } from '@ngx-translate/core';
import { BackendQueryApiService } from 'api/backend-query.api';
import { FetchPoolDataService } from 'services/fetchdata.service';

@Component({
    selector: 'app-connect',
    templateUrl: './connect.component.html',
    styleUrls: ['./connect.component.less'],
})
export class ConnectComponent implements OnInit {
    instancesItems: IInstanceItem[];
    instance: IInstanceItem;
    instancesReady: boolean;
    ppdaMode: boolean;
    userName: string;
    instancesKeys: (keyof IInstanceItem)[] = ['protocol', 'type', 'port', 'backends', 'shareDiff'];

    constructor(
        private backendQueryApiService: BackendQueryApiService,
        private storageService: StorageService,
        private translateService: TranslateService,
        private fetchPoolDataService: FetchPoolDataService,
    ) {}

    ngOnInit(): void {
        this.fetchPoolDataService.coins({ coin: '', type: 'connect', forceUpdate: true });
        this.instancesItems = [];
        this.instancesReady = false;
        this.ppdaMode = false;
        this.getInstances();
    }
    onInstanceClick(instance): void {
        this.instance = instance;
    }

    private getInstances(): void {
        this.backendQueryApiService.instanceEnumerateAll().subscribe(({ instances }) => {
            //debugger;
            instances.forEach(el => {
                this.instancesItems.push(el);
            });
            this.instance = this.instancesItems[0];
            if (
                true ||
                (this.storageService.coinsList.length === 1 &&
                    this.storageService.currCoin === 'sha256')
            ) {
                this.instance.backends = this.translateService.instant('sha256.PPDA');
                this.ppdaMode = true;
            }
            this.userName = this.storageService.activeUserData.name;

            this.instancesReady = true;
        });
    }
}
