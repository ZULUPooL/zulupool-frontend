import { Component, OnInit } from '@angular/core';

import { EAppRoutes } from 'enums/routing';
import { BackendQueryApiService } from 'api/backend-query.api';
import { TCoinName } from 'interfaces/coin';
import { IWorkerStatsHistoryItem } from 'interfaces/backend-query';
import { AppService } from 'services/app.service';
import { ESuffix } from 'pipes/suffixify.pipe';
import { ETime } from 'enums/time';
import { StorageService } from 'services/storage.service';
import { DefaultParams } from 'components/defaults.component';
import { FetchPoolDataService } from 'services/fetchdata.service';

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
        //this.getCoinsList();
        /*this.backendQueryApiService
            .getUserBalance()
            .subscribe(({ balances }) => {
                balances = balances.filter(item => item.coin === "sha256");

                this.coins = balances.map(item => item.coin);

                if (this.coins.length > 0) {
                    this.onCurrentCoinChange(this.coins[0]);
                }
            });*/
    }
    /*
    private getCoinsList(): void {
        this.backendQueryApiService.getPoolCoins().subscribe(({ coins }) => {
            if (coins.length >= 2) {
                coins.push({
                    name: coins[0].algorithm,
                    fullName: coins[0].algorithm,
                    algorithm: coins[0].algorithm,
                });
            }
            this.coins = coins.map(item => item.name);
            if (this.coins.length > 0) {
                const coin = this.coins.includes(coins[0].algorithm)
                    ? coins[0].algorithm
                    : this.coins[0];
                this.onCurrentCoinChange(coin);
            }
        });
    }
*/
    public onCurrentCoinChange(coin: TCoinName): void {
        this.currentCoin = coin;
        const groupByInterval = ETime.Day;
        if (this.storageService.coinsObj[coin].is.nameSplitted)
            coin = coin + '.' + this.storageService.coinsObj[coin].info.algorithm;
        const currTime = parseInt(
            ((new Date().setMinutes(0, 0, 0).valueOf() / 1000) as any).toFixed(0),
        );
        this.appService.user.subscribe(user => {
            this.backendQueryApiService
                .getUserStatsHistory({
                    coin,
                    timeFrom: currTime - 30 * groupByInterval,
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
