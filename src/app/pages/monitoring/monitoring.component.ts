import { Component, OnInit, OnDestroy } from '@angular/core';
import { SubscribableComponent } from 'ngx-subscribable';
import { StorageService } from 'services/storage.service';
import { ZoomSwitchService } from 'services/zoomswitch.service';

import { DefaultParams } from 'components/defaults.component';
import { ILiveStatCommon, ICoinParams, ILiveStatWorker } from 'interfaces/common';

import { EAppRoutes } from 'enums/routing';
import { BackendManualApiService } from 'api/backend-manual.api';
import { TCoinName } from 'interfaces/coin';
import { IUserBalanceItem, IWorkerStatsItem } from 'interfaces/backend-query';
import { ESuffix } from 'pipes/suffixify.pipe';
import { FetchPoolDataService } from 'services/fetchdata.service';

enum EWorkerState {
    Normal = 'normal',
    Warning = 'warning',
    Error = 'error,',
}

@Component({
    selector: 'app-monitoring',
    templateUrl: './monitoring.component.html',
    styleUrls: ['./monitoring.component.less'],
})
export class MonitoringComponent extends SubscribableComponent implements OnInit, OnDestroy {
    readonly EAppRoutes = EAppRoutes;
    readonly EWorkerState = EWorkerState;
    readonly ESuffix = ESuffix;

    currentBalance: IUserBalanceItem;
    workersList: IWorkerStatsItem[];
    haveBalanceData: boolean;
    isLiveLoading: boolean;
    liveStats: ILiveStatCommon;
    liveStatsWorkers: ILiveStatWorker[];
    isBalanceDataLoading: boolean;
    isManualPayoutSending: boolean;

    get activeCoinName(): string {
        return this.storageService.currCoin;
    }
    set activeCoinName(coin: string | '') {
        this.storageService.currCoin = coin;
    }

    get activeCoinObj(): ICoinParams {
        return this.storageService.coinsObj[this.storageService.currCoin];
    }
    set activeCoinObj(data: ICoinParams) {
        this.storageService.coinsObj[this.storageService.currCoin] = data;
    }

    get isSending(): boolean {
        return this.isManualPayoutSending;
    }
    private subscrip: any;
    private fetcherTimeoutId: number;
    private mainCoinApplyTimeoutId: number;

    constructor(
        private backendManualApiService: BackendManualApiService,
        private zoomSwitchService: ZoomSwitchService,
        private fetchPoolDataService: FetchPoolDataService,
        private storageService: StorageService,
    ) {
        super();
    }

    ngOnInit(): void {
        this.start();
        this.subs();
        this.periodicFetch();
        this.fetchPoolDataService.coins({ coin: '', type: 'user', forceUpdate: true });
    }

    ngOnDestroy(): void {
        clearTimeout(this.fetcherTimeoutId);
        clearTimeout(this.mainCoinApplyTimeoutId);
        //this.subscrip.forEach(el => el.unsubscribe);
    }
    onWorkerCurrentCoinChange(coinName: TCoinName): void {
        //TODO
        return;
        /*
        if (
            coinName === "" ||
            this.loading.coins ||
            this.loading.liveStat ||
            this.loading.workerHistStat
            //this.switchWorkerCoin
        )
            return;
        this.loading.workerHistStat = true;
        this.currentCoinNameWorker = coinName;
        //this.fetchWorkerData(coinName, this.currentWorkerId);
        this.fetchPoolDataService.getUserCoinStats(coinName);*/
    }

    onCurrentCoinChange(coin: string): void {
        if (coin === null || coin === '') return;
        this.storageService.coinsObj[coin].isNeedRefresh = true;
        this.setMainCoinTimer(coin);
        this.activeCoinName = coin;
        this.storageService.currCoin = coin;
        this.getLiveInfo(coin);
    }

    onWorkerRowClick(workerId: string): void {
        //TODO
    }

    getWorkerState(time: number): EWorkerState {
        if (time > 30 * 60) {
            return EWorkerState.Error;
        }

        if (time > 15 * 60) {
            return EWorkerState.Warning;
        }

        return EWorkerState.Normal;
    }
    clearWorker(): void {
        //TODO
        /*
        this.userWorkersStatsHistory = {
            name: '',
            stats: [],
            powerMultLog10: 6,
            coin: '',
            ready: false,
        };
        //this.workerStatsHistoryReady = false;
        //this.userWorkersStatsHistory = null;
        this.storageService.currentCoinInfoWorker = null;
        this.storageService.currentWorkerName = null;
        //this.storageService.needWorkerInint = false;*/
    }

    manualPayout(): void {
        return; //TODO
        this.isManualPayoutSending = true;
        const coin = this.activeCoinName;
        this.backendManualApiService.forcePayout({ coin }).subscribe(
            () => {
                this.isManualPayoutSending = false;
            },
            () => {
                this.isManualPayoutSending = false;
            },
        );
    }

    private start() {
        this.haveBalanceData = false;
        this.isLiveLoading = true;
        this.isBalanceDataLoading = true;
        this.storageService.currType = DefaultParams.REQTYPE.USER;
    }

    private processZoom(newZoom: string) {
        if (this.storageService.currZoom !== newZoom) {
            this.storageService.currZoom = newZoom;
            this.setupMainCoin(this.activeCoinName);
            const h = this.activeCoinObj.history;
            (h.chart.label = []), (h.chart.data = []), (h.data = []);
            this.fetchData();
        }
    }

    private processCoins() {
        const store = this.storageService;
        const coinI = store.coinsList.length > 2 ? store.coinsList.length - 1 : 0;
        const coin = store.coinsList[coinI];
        this.setupMainCoin(coin);
        this.getLiveInfo(coin);
    }

    private processLive(coin: string) {
        this.getBalanceInfo(coin);
        if (this.activeCoinName === coin) {
            this.liveStats = this.activeCoinObj.live.data;
            this.liveStatsWorkers = this.liveStats.miners;
        }
        this.isLiveLoading = false;
        this.getHistoryInfo(coin);
    }

    private getBalanceInfo(coin: string) {
        if (this.activeCoinObj.user.isBalanceLoading) return;
        else this.activeCoinObj.user.isBalanceLoading = true;
        if (!this.activeCoinObj.isAlgo) {
            this.isBalanceDataLoading = true;
            this.haveBalanceData = true;
            this.getBalanceInfo(coin);
        }
        if (coin === this.activeCoinName) this.fetchPoolDataService.balance({ coin, type: 'pool' });
        this.isBalanceDataLoading = true;
    }
    private processBalance(coin: string) {
        if (this.activeCoinName !== coin) return;
        if (this.activeCoinObj.isAlgo) return; //TODO PPDA Users
        this.currentBalance = this.activeCoinObj.user.balance;
        this.isBalanceDataLoading = false;
    }
    private setupMainCoin(coin: string) {
        if (this.storageService.mainCoin !== coin) {
            this.storageService.coinsList.forEach(el => {
                if (el !== coin) {
                    this.storageService.coinsObj[el].isMain = false;
                    this.storageService.coinsObj[el].isNeedRefresh = false;
                    this.storageService.coinsObj[el].history.chart.label = [];
                    this.storageService.coinsObj[el].history.chart.data = [];
                    this.storageService.coinsObj[el].history.data = [];
                } else {
                    this.storageService.coinsObj[el].isMain = true;
                    this.storageService.coinsObj[el].isNeedRefresh = true;
                }
            });
            this.storageService.mainCoin = coin;
            this.storageService.currCoin = coin;
            this.getLiveInfo(coin);
        }
    }
    private getLiveInfo(coin: string) {
        if (this.activeCoinObj.live.isLoading) return;
        else this.activeCoinObj.live.isLoading = true;
        if (coin === this.activeCoinName) this.isLiveLoading = true;
        this.fetchPoolDataService.live({ coin, type: 'user' });
    }
    private getHistoryInfo(coin: string) {
        if (this.activeCoinObj.history.isLoading || this.activeCoinObj.live.isLoading) return;
        else this.activeCoinObj.history.isLoading = true;
        this.fetchPoolDataService.history({ coin, type: 'user' });
    }
    private setMainCoinTimer(coin: string, timer: number = DefaultParams.BASECOINSWITCHTIMER) {
        clearTimeout(this.mainCoinApplyTimeoutId);
        this.mainCoinApplyTimeoutId = setTimeout(() => {
            this.setupMainCoin(coin);
        }, timer * 1000);
    }

    private fetchData() {
        const list = this.storageService.coinsList;
        const coins = this.storageService.coinsObj;
        for (let i in list) {
            if (coins[list[i]].isNeedRefresh) this.getLiveInfo(list[i]);
        }
    }
    private periodicFetch(
        timer: number = DefaultParams.ZOOMPARAMS[this.storageService.currZoom].refreshTimer,
    ) {
        clearTimeout(this.fetcherTimeoutId);
        this.fetcherTimeoutId = setTimeout(() => {
            this.fetchData();
            this.periodicFetch();
        }, timer * 1000);
    }

    private subs(): void {
        this.subscrip = [
            this.zoomSwitchService.zoomSwitch.subscribe(zoom => {
                if (zoom !== '') this.processZoom(zoom);
            }),
            this.fetchPoolDataService.apiGetListOfCoins.subscribe(data => {
                if (data.status && data.type === 'user') this.processCoins();
            }),
            this.fetchPoolDataService.apiGetLiveStat.subscribe(data => {
                if (data.status && data.type === 'user') this.processLive(data.coin);
            }),
            this.fetchPoolDataService.apiGetUserBalance.subscribe(data => {
                if (data.status && data.type === 'user') this.processBalance(data.coin);
            }),
        ];
    }

    private reset() {
        this.storageService.poolCoins = null;
        this.storageService.poolCoinsliveStat = null;
        this.storageService.currentCoinInfo = null;
        this.storageService.chartsTimeFrom = null;
        //this.storageService.sessionId = null;
        //this.storageService.targetLogin = null;
        this.storageService.whatCoins = null;
        this.storageService.poolCoinsliveStat2 = null;
        this.storageService.poolCoinsliveStat = null;
        this.storageService.currentCoinInfo = null;
        this.storageService.currentCoinInfoWorker = null;
        this.storageService.currentUser = null;
        this.storageService.chartsTimeFrom = null;
        this.storageService.chartsWorkerTimeFrom = null;
        this.storageService.chartsWorkerBaseData = null;
        this.storageService.currentUserliveStat = null;
        this.storageService.currentWorkerName = null;
        this.storageService.needWorkerInint = null;
        this.storageService.userSettings = null;
        this.storageService.userCredentials = null;
    }
}
