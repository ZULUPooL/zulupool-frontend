import { Component, OnInit } from '@angular/core';
//import { FormBuilder } from '@angular/forms';
//import { UserApiService } from 'api/user.api';
//import { IUserSettings } from 'interfaces/user';
import { IInstanceItem } from 'interfaces/backend-query';
import { StorageService } from 'services/storage.service';
//import { NzModalService } from 'ng-zorro-antd/modal';
import { TranslateService } from '@ngx-translate/core';
import { BackendQueryApiService } from 'api/backend-query.api';
import { FetchPoolDataService } from 'services/fetchdata.service';
import { DefaultParams } from 'components/defaults.component';

@Component({
    selector: 'app-connect',
    templateUrl: './connect.component.html',
    styleUrls: ['./connect.component.less'],
})
export class ConnectComponent implements OnInit {
    instances: IInstanceItem[];
    instanceItem: IInstanceItem;
    instancesReady: boolean;
    //ppdaMode: boolean;
    //userName: string;
    instancesKeys: (keyof IInstanceItem)[] = ['protocol', 'type', 'port', 'backends', 'shareDiff'];
    //modeString: boolean;

    isReady: boolean;
    fastJobWarning: boolean;
    fastCoinName: string;

    isBeta: boolean;
    isPPDA: boolean;
    //ppdaAlgo: string;
    //coins: string;
    modeString: string;
    urlTarget: string;
    port: number;
    canNiceHash: boolean;
    canMRR: boolean;
    canAsicBoost: boolean;
    algoIsAsicBoost: boolean;
    emailAddr: string;
    username = '';
    pwd = '';

    constructor(
        private backendQueryApiService: BackendQueryApiService,
        private storageService: StorageService,
        private translateService: TranslateService,
        private fetchPoolDataService: FetchPoolDataService,
    ) {}

    ngOnInit(): void {
        this.setupStart();
        this.fetchPoolDataService.apiGetListOfCoins.subscribe(data => {
            if (data.status && data.type === 'connect') this.getInstances();
        });
        this.fetchPoolDataService.coins({ coin: '', type: 'connect', forceUpdate: true });
    }
    /*
    ngOnDestroy(): void {
        this.fetchPoolDataService.apiGetListOfCoins.unsubscribe();
    }*/

    private setupStart() {
        this.emailAddr = DefaultParams.SUPPORTMAIL;
        this.fastJobWarning = false;
        this.isBeta = true;
        this.isPPDA = false;
        this.isReady = false;
        this.instancesReady = false;
        this.port = 0;
        this.canNiceHash = true;
        this.algoIsAsicBoost = true;
        this.canAsicBoost = true;
        this.canMRR = false;
        this.instances = [];
    }

    setInstanceParams(item: IInstanceItem): void {
        if (this.instancesReady && this.port === item.port) return;
        this.isReady = false;

        if (this.isPPDA) {
            this.modeString = this.translateService.instant('connect.toStart.ppdaMode', {
                ppdaAlgo: DefaultParams.PPDAALGO,
            });
        } else {
            const coins = createCoinString(item.backends);
            this.modeString = this.translateService.instant('connect.toStart.smartMode', { coins });
        }
        this.port = item.port;
        this.urlTarget = DefaultParams.STRATUMS[item.type] + DefaultParams.DNSNAME + ':' + item.port;
        this.algoIsAsicBoost = item.type === 'HTR' || item.type === 'BTC';
        this.fastJobWarning = false;
        this.fastCoinName = '';
        item.backends.forEach(coin => {
            if (!this.fastJobWarning && DefaultParams.FASTJOBCOINS.includes(coin) && item.backends.length < 3) {
                this.fastJobWarning = true;
                this.fastCoinName = coin;
            }
        });

        if (!this.instancesReady) this.instancesReady = true;

        //this.username = this.translateService.instant('connect.toStart.pwd');
        //this.pwd = this.translateService.instant('connect.toStart.username');

        this.isReady = true;

        function createCoinString(coins: string[]): string {
            let str = '';
            coins.forEach(coin => {
                if (str !== '') {
                    str = str + ', ' + coin;
                } else str = coin;
            });
            return str;
        }
    }

    private getInstances(): void {
        this.backendQueryApiService.instanceEnumerateAll().subscribe(({ instances }) => {
            const store = this.storageService;
            if (store.coinsList.length === 1) {
                this.isPPDA = true;
                this.instances.push(instances.find(el => el.port === 5010 || el.port === 25010));
                this.instances[0].backends = ['sha256d'];
                this.instances = [this.instances[0]];
            } else this.instances = instances;

            this.setInstanceParams(this.instances[0]);
        });
    }
}
