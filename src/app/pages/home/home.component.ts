import { Component, OnInit } from '@angular/core';
import { SubscribableComponent } from 'ngx-subscribable';
import { StorageService } from 'services/storage.service';

import { DefaultParams } from 'components/defaults.component';
import { EAppRoutes, userRootRoute } from 'enums/routing';
import { ESuffix } from 'pipes/suffixify.pipe';
import { ZoomSwitchService } from 'services/zoomswitch.service';
import { FetchPoolDataService } from 'services/fetchdata.service';

import { ILiveStatCommon, IBlockItem, IBlocks, ICoinParams } from 'interfaces/common';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.less'],
})
export class HomeComponent extends SubscribableComponent implements OnInit {
    readonly EAppRoutes = EAppRoutes;
    readonly ESuffix = ESuffix;

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

    get isLiveStatLoading(): boolean {
        return !this.isLiveLoading;
    }

    get isLoadingBlocks(): boolean {
        return this.isBlocksLoading;
    }

    isLiveLoading: boolean;
    liveStats: ILiveStatCommon;

    haveBlocksData: boolean;
    isBlocksLoading: boolean;
    blocks: IBlocks[];

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
    private subscrip: any;
    private explorersLinks = DefaultParams.BLOCKSLINKS;
    private fetcherTimeoutId: number;
    private mainCoinApplyTimeoutId: number;

    constructor(
        private zoomSwitchService: ZoomSwitchService,
        private fetchPoolDataService: FetchPoolDataService,
        private storageService: StorageService,
    ) {
        super();
    }

    private subs(): void {
        this.subscrip = [
            this.zoomSwitchService.zoomSwitch.subscribe(zoom => {
                if (zoom !== '') this.processZoom(zoom);
            }),
            this.fetchPoolDataService.apiGetListOfCoins.subscribe(data => {
                if (data.status && data.type === 'pool') this.processCoins();
            }),
            this.fetchPoolDataService.apiGetLiveStat.subscribe(data => {
                if (data.status && data.type === 'pool') this.processLive(data.coin);
            }),
            this.fetchPoolDataService.apiGetBlocks.subscribe(data => {
                if (data.status && data.type === 'pool') this.processBlocks(data.coin);
            }),
        ];
    }

    ngOnInit(): void {
        this.reset();
        this.start();
        this.subs();
        this.periodicFetch();
        this.fetchPoolDataService.coins({ coin: '', type: 'pool', forceUpdate: true });
    }
    ngOnDestroy(): void {
        //this.fetchPoolDataService.coins();
        clearTimeout(this.fetcherTimeoutId);
        clearTimeout(this.mainCoinApplyTimeoutId);
        //this.zoomSwitchService.zoomSwitch.unsubscribe();
        //this.fetchPoolDataService.apiGetListOfCoins.st;
        //this.fetchPoolDataService.apiGetLiveStat.unsubscribe();
        //this.fetchPoolDataService.apiGetBlocks.unsubscribe();
        this.subscrip.forEach(el => el.unsubscribe);
    }

    onBlockClick(block: IBlockItem): void {
        const url = this.explorersLinks[this.activeCoinName] + block.hash;
        window.open(url, '_system');
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
    onCurrentCoinChange(coin: string): void {
        if (coin === null || coin === '') return;
        this.storageService.coinsObj[coin].isNeedRefresh = true;
        this.setMainCoinTimer(coin);
        this.activeCoinName = coin;
        this.haveBlocksData = !this.activeCoinObj.isAlgo;
        this.getLiveInfo(coin);
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
            if (!this.activeCoinObj.isAlgo) {
                this.isBlocksLoading = true;
                this.haveBlocksData = true;
                this.getBloksInfo(coin);
            }
            this.liveStats = this.activeCoinObj.live.data as any;
        }
        this.isLiveLoading = false;
        this.getHistoryInfo(coin);
    }
    private processBlocks(coin: string) {
        if (this.activeCoinName !== coin) return;
        if (this.activeCoinObj.isAlgo) return;
        this.blocks = this.activeCoinObj.blocks.data as any;
        this.isBlocksLoading = false;
    }

    private setupMainCoin(coin: string) {
        if (this.storageService.mainCoin !== coin) {
            this.storageService.coinsList.forEach(el => {
                const store = this.storageService.coinsObj[el];
                if (el !== coin) {
                    store.isMain = false;
                    store.isNeedRefresh = false;
                    store.history.chart.label = [];
                    store.history.chart.data = [];
                    store.history.data = [];
                } else {
                    store.isMain = true;
                    store.isNeedRefresh = true;
                }
            });
            this.storageService.mainCoin = coin;
            this.activeCoinName = coin;
            //this.mainCoinName = coin;
            this.getLiveInfo(coin);
        }
    }
    private getLiveInfo(coin: string) {
        const info = this.storageService.coinsObj[coin];
        if (info.live.isLoading) return;
        else info.live.isLoading = true;
        if (coin === this.activeCoinName) this.isLiveLoading = true;
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
        if (coin === this.activeCoinName) this.isBlocksLoading = true;
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
    /*
    private clearRefresh(coin: string) {
        const list = this.storageService.coinsList;
        const coins = this.storageService.coinsObj;
        for (let i in list) {
            if (list[i] !== coin) coins[list[i]].isNeedRefresh = false;
            if (list[i] !== coin) coins[list[i]].isMain = false;
        }
    }
*/
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
