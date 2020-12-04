import { Component, OnInit } from '@angular/core';

import { EAppRoutes } from 'enums/routing';
import { BackendQueryApiService } from 'api/backend-query.api';
import { TCoinName } from 'interfaces/coin';
import { IWorkerStatsHistoryItem } from 'interfaces/backend-query';
import { AppService } from 'services/app.service';
import { ESuffix } from 'pipes/suffixify.pipe';
import { StorageService } from 'services/storage.service';
import { DefaultParams } from 'components/defaults.component';
import { FetchPoolDataService } from 'services/fetchdata.service';
import { ETime } from 'enums/time';

@Component({
    selector: 'app-history',
    templateUrl: './history.component.html',
    styleUrls: ['./history.component.less'],
})
export class HistoryComponent implements OnInit {
    readonly EAppRoutes = EAppRoutes;
    readonly ESuffix = ESuffix;

    coins: TCoinName[];
    currentCoin: TCoinName;

    statsHistory: IWorkerStatsHistoryItem[];
    powerMultLog10: number;

    constructor(
        private backendQueryApiService: BackendQueryApiService,
        private appService: AppService,
        private storageService: StorageService,
        private fetchPoolDataService: FetchPoolDataService,
    ) {}

    ngOnInit(): void {
        this.storageService.currType = 'history';
        this.fetchPoolDataService.coins({ coin: '', type: 'history', forceUpdate: true });
    }
    changeTarget(target: string) {
        this.onCurrentCoinChange(this.currentCoin);
    }

    onCurrentCoinChange(coin: TCoinName): void {
        this.currentCoin = coin;
        if (this.storageService.coinsObj[coin].is.nameSplitted)
            coin = coin + '.' + this.storageService.coinsObj[coin].info.algorithm;
        const groupByInterval = ETime.Day;
        this.appService.user.subscribe(user => {
            this.backendQueryApiService
                .getUserStatsHistory({
                    coin,
                    timeFrom: this.storageService.targetUserRegDate,
                    groupByInterval,
                })
                .subscribe(({ stats, powerMultLog10 }) => {
                    stats.reverse();

                    stats.forEach(item => {
                        item.time -= groupByInterval;
                    });

                    this.statsHistory = stats;
                    this.powerMultLog10 = powerMultLog10;
                });
        });
    }
}
