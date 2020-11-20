import { DefaultParams } from 'components/defaults.component';

import { Component, OnInit } from '@angular/core';
import { SubscribableComponent } from 'ngx-subscribable';

import { StorageService } from 'services/storage.service';
import { not } from 'logical-not';

import { EAppRoutes, userRootRoute } from 'enums/routing';
import { BackendQueryApiService } from 'api/backend-query.api';
/*import {
    IPoolStatsItem,
    IFoundBlock,
    IWorkerStatsItem,
    IPoolStatsHistoryItem,
    IPoolHistoryInfo,
    IPoolCoinsItem,
    //IHistorySettings,
    //ILiveStatSettings,
    ICoinInfo,
    ICinfo,
    //ICoinsInfo,

    //   IPoolCoinsItem,
} from "interfaces/backend-query";*/
import { ESuffix } from 'pipes/suffixify.pipe';
/*import { TCoinName } from "interfaces/coin";*/
//import { CoinSwitcherComponent } from "components/coin-switcher/coin-switcher.component";
import { ZoomSwitchService } from 'services/zoomswitch.service';
import { FetchPoolDataService } from 'services/fetchdata.service';

import {
    ICoinsData,
    ILiveStatPool,
    IHistoryItem2,
    IBlockItem,
    ICoinItem,
    IZoomParams,
    ILiveStat,
    IBlocks,
} from 'interfaces/common';

//import { statusCommonResp } from "enums/api-enums";
//import { SettingsComponent } from "pages/settings/settings.component";
//import { from } from "rxjs";
//import { renderFlagCheckIfStmt } from "@angular/compiler/src/render3/view/template";

//import { global } from '@angular/compiler/src/util';
//import { ETime } from "enums/time";

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.less'],
})
export class HomeComponent extends SubscribableComponent implements OnInit {
    readonly EAppRoutes = EAppRoutes;
    readonly ESuffix = ESuffix;

    get isLiveStatLoading(): boolean {
        return !this.isLiveLoading;
        //return this.storageService.coinsObj[this.coinName].live.isLoading;
    }

    get activeCoinName(): string {
        return this.storageService.currCoin;
    }
    set activeCoinName(coin: string | '') {
        this.storageService.currCoin = coin;
    }

    get isLoadingBlocks(): boolean {
        return this.isBlocksLoading;
    }

    coinName: string;
    mainCoinName: string;

    isLiveLoading: boolean;
    liveStats: ILiveStatPool;

    //isHistoryLoading: boolean;
    //historyStats: IHistoryItem2[];

    haveBlocksData: boolean;
    isBlocksLoading: boolean;
    blocks: IBlocks[];

    //powerChartDataReady: boolean;
    /*    powerChartData: {
        actualData: IHistoryItem2[];
        powerMultLog10: number;
        chartName: string;
        prevData: IHistoryItem2[];
        clear: boolean;
        zoom: boolean;
    };
*/
    //coinsData: ICoinsInfo = {} as ICoinsInfo;

    //isStarting = true;

    foundBlockKeys: (keyof IBlockItem)[] = [
        'height',
        'hash',
        'confirmations',
        'generatedCoins',
        'foundBy',
        'time',
    ];
    foundBlockKeysMobile: (keyof IBlockItem)[] = ['height', 'hash', 'confirmations', 'foundBy'];

    signUpLink = {
        href: `/${EAppRoutes.Auth}`,
        params: {
            to: decodeURIComponent(`/${userRootRoute}`),
            registration: true,
        },
    };

    //private coinsList: IPoolCoinsItem[] = [];
    //private clearChart = false;
    //private clearZoom = false;
    //private isZoomStarting: boolean;
    private explorersLinks = DefaultParams.BLOCKSLINKS;

    //private refreshTimer: number = 0;
    //private timeToSetNewBase = DefaultParams.BASECOINSWITCHTIMER;
    private fetcherTimeoutId: number;
    private mainCoinApplyTimeoutId: number;

    constructor(
        //        private coinSwitchService: CoinSwitchService,
        //private coinSwitcherComponent: CoinSwitcherComponent,
        private zoomSwitchService: ZoomSwitchService,
        //private defaultParams: DefaultParams,
        private fetchPoolDataService: FetchPoolDataService,
        private storageService: StorageService,
    ) {
        super();
    }

    private subs(): void {
        this.subscriptions.push(
            this.zoomSwitchService.zoomSwitch.subscribe(zoom => {
                if (zoom !== '') this.processZoom(zoom);
            }),
            this.fetchPoolDataService.apiGetListOfCoins.subscribe(result => {
                if (result) this.processCoins();
            }),
            this.fetchPoolDataService.apiGetLiveStat.subscribe(data => {
                if (data.status) this.processLive(data.coin);
            }),
            this.fetchPoolDataService.apiGetBlocks.subscribe(data => {
                if (data.status) this.processBlocks(data.coin);
            }),
        );
    }

    ngOnInit(): void {
        this.reset();
        this.start();
        this.subs();
        this.periodicFetch();
        this.fetchPoolDataService.coins();
    }
    ngOnDestroy(): void {
        clearTimeout(this.fetcherTimeoutId);
        clearTimeout(this.mainCoinApplyTimeoutId);
        this.subscriptions.forEach(el => el.unsubscribe);
    }

    onBlockClick(block: IBlockItem): void {
        const url = this.explorersLinks[this.activeCoinName] + block.hash;
        window.open(url, '_system');
    }
    private processZoom(newZoom: string) {
        if (this.storageService.currZoom !== newZoom) {
            this.storageService.currZoom = newZoom;
            this.setupMainCoin(this.coinName);
            this.storageService.coinsObj[this.coinName].history.chart.label = [];
            this.storageService.coinsObj[this.coinName].history.chart.data = [];
            this.storageService.coinsObj[this.coinName].history.data = [];
            this.fetchData();
        }
    }
    onCurrentCoinChange(coin: string): void {
        if (coin === null || coin === '') return;
        this.storageService.coinsObj[coin].isNeedRefresh = true;
        this.setMainCoinTimer(coin);
        this.coinName = coin;
        this.storageService.currCoin = coin;
        this.haveBlocksData = !this.storageService.coinsObj[coin].isAlgo;
        this.getLiveInfo(coin);
        //if (this.storageService.coinsObj[coin].isMain) this.clearRefresh(coin);
    }

    truncate(fullStr) {
        let s = { sep: '....', front: 3, back: 7 };
        return fullStr.substr(0, s.front) + s.sep + fullStr.substr(fullStr.length - s.back);
    }
    private processCoins() {
        const store = this.storageService;
        const coinI = store.coinsList.length > 2 ? store.coinsList.length - 1 : 0;
        const coin = store.coinsList[coinI];
        this.setupMainCoin(coin);
        this.getLiveInfo(coin);
    }
    private processLive(coin: string) {
        if (this.activeCoinName === coin) {
            const store = this.storageService.coinsObj[coin];
            if (!store.isAlgo) {
                this.isBlocksLoading = true;
                this.haveBlocksData = true;
                this.getBloksInfo(coin);
            }
            this.liveStats = store.live.data as any;
        }
        this.isLiveLoading = false;
        this.getHistoryInfo(coin);
    }
    private processBlocks(coin: string) {
        if (this.activeCoinName !== coin) return;
        const store = this.storageService.coinsObj[coin];
        if (store.isAlgo) return;
        //this.haveBlocksData;
        this.blocks = store.blocks.data as any;
        this.isBlocksLoading = false;
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
            this.mainCoinName = coin;
            this.getLiveInfo(coin);
        }
    }
    private getLiveInfo(coin: string) {
        const info = this.storageService.coinsObj[coin];
        if (info.live.isLoading) return;
        else info.live.isLoading = true;
        if (coin === this.coinName) this.isLiveLoading = true;
        this.fetchPoolDataService.live({ coin, type: 'pool' });
    }
    private getHistoryInfo(coin: string) {
        const info = this.storageService.coinsObj[coin];
        if (info.history.isLoading || info.live.isLoading) return;
        else info.history.isLoading = true;
        this.fetchPoolDataService.history({ coin, type: 'pool' });
    }
    private getBloksInfo(coin: string) {
        const info = this.storageService.coinsObj[coin];
        if (info.blocks.isLoading) return;
        else info.blocks.isLoading = true;
        if (coin === this.coinName) this.isBlocksLoading = true;
        this.fetchPoolDataService.blocks({ coin, type: 'pool' });
    }

    private fetchData() {
        const list = this.storageService.coinsList;
        const coins = this.storageService.coinsObj;
        for (let i in list) {
            if (coins[list[i]].isNeedRefresh) this.getLiveInfo(list[i]);
        }
    }

    private setMainCoinTimer(coin: string, timer: number = DefaultParams.BASECOINSWITCHTIMER) {
        clearTimeout(this.mainCoinApplyTimeoutId);
        this.mainCoinApplyTimeoutId = setTimeout(() => {
            this.setupMainCoin(coin);
        }, timer * 1000);
    }

    private start() {
        this.storageService.currType = DefaultParams.REQTYPE.POOL;
        this.isLiveLoading = true;
        this.haveBlocksData = false;
        this.blocks = [];
    }

    private clearRefresh(coin: string) {
        const list = this.storageService.coinsList;
        const coins = this.storageService.coinsObj;
        for (let i in list) {
            if (list[i] !== coin) coins[list[i]].isNeedRefresh = false;
            if (list[i] !== coin) coins[list[i]].isMain = false;
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

    private reset() {
        //this.storageService.poolCoins = null;
        this.storageService.poolCoinsliveStat = null;
        this.storageService.currentCoinInfo = null;
        this.storageService.chartsTimeFrom = null;
        // this.storageService.chartsBaseData = null;

        //this.storageService.sessionId = null;
        //this.storageService.targetLogin = null;
        this.storageService.whatCoins = null;
        //this.storageService.poolCoins2 = null;
        this.storageService.poolCoinsliveStat2 = null;
        //this.storageService.chartsDataLoaded = null;
        //this.storageService.poolCoinsList = null;
        this.storageService.poolCoinsliveStat = null;
        this.storageService.currentCoinInfo = null;
        this.storageService.currentCoinInfoWorker = null;
        this.storageService.currentUser = null;
        this.storageService.chartsTimeFrom = null;
        this.storageService.chartsWorkerTimeFrom = null;
        // this.storageService.chartsBaseData = null;
        this.storageService.chartsWorkerBaseData = null;
        this.storageService.currentUserliveStat = null;
        this.storageService.currentWorkerName = null;
        this.storageService.needWorkerInint = null;
        this.storageService.userSettings = null;
        this.storageService.userCredentials = null;
    }
}
