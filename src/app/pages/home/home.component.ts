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
        return this.isLiveLoading;
    }

    get isLoadingBlocks(): boolean {
        return this.isBlocksLoading;
    }

    isLiveLoading: boolean = true;
    liveStats: ILiveStatCommon;
    mainChartCoin: string = '';
    haveBlocksData: boolean = false;
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
    private historyFetcherTimeoutId: number;
    private blocksFetcherTimeoutId: number;
    private changeMainChartCoinTimeoutId: number;
    private isStarting: boolean;
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
                if (zoom !== '') this.processZoomChange(zoom);
            }),
            this.fetchPoolDataService.apiGetListOfCoins.subscribe(data => {
                if (data.status && data.type === this.storageService.currType) this.processCoins();
            }),
            this.fetchPoolDataService.apiGetLiveStat.subscribe(data => {
                if (data.status && data.type === this.storageService.currType)
                    this.processLive(data.coin);
            }),
            this.fetchPoolDataService.apiGetBlocks.subscribe(data => {
                if (data.status && data.type === this.storageService.currType)
                    this.processBlocks(data.coin);
            }),
        ];
    }

    ngOnInit(): void {
        this.isStarting = true;
        //this.storageService.resetChartsData = true;
        this.storageService.currType = DefaultParams.REQTYPE.POOL;
        this.blocks = [];
        this.subs();
        this.fetchPoolDataService.coins({ coin: '', type: 'pool', forceUpdate: true });
        //this.historyFetcher();
        //this.blocksFetch();
    }
    ngOnDestroy(): void {
        //this.storageService.resetChartsData = true;
        clearTimeout(this.historyFetcherTimeoutId);
        clearTimeout(this.changeMainChartCoinTimeoutId);
        clearTimeout(this.blocksFetcherTimeoutId);
        this.subscrip.forEach(el => el.unsubscribe());
    }

    onBlockClick(block: IBlockItem): void {
        const url = this.explorersLinks[this.activeCoinName] + block.hash;
        window.open(url, '_system');
    }

    onCurrentCoinChange(coin: string): void {
        if (coin === null || coin === '') return;
        if (this.activeCoinName === '') this.activeCoinName = coin;
        this.storageService.coinsObj[coin].is.chartRefresh = true;
        this.setMainCoinTimer(coin);
        this.storageService.coinsObj[this.activeCoinName].is.liveVisible = false;
        this.storageService.coinsObj[this.activeCoinName].is.blocksVisible = false;
        this.storageService.coinsObj[coin].is.liveVisible = true;
        this.storageService.coinsObj[coin].is.blocksVisible = !this.storageService.coinsObj[coin].is
            .algo;
        this.haveBlocksData = !this.storageService.coinsObj[coin].is.algo;
        this.activeCoinName = coin;
        this.getLiveInfo();
        this.getBloksInfo();
    }

    truncate(fullStr) {
        let s = { sep: '....', front: 3, back: 7 };
        return fullStr.substr(0, s.front) + s.sep + fullStr.substr(fullStr.length - s.back);
    }

    private processZoomChange(zoom: string) {
        if (zoom === null) debugger;
        if (zoom === undefined) debugger;
        if (zoom === '') debugger;
        if (this.storageService.coinsList.length === 0 || this.isStarting) return;
        const coinsObj = this.storageService.coinsObj;
        const mainCoinObj = this.storageService.chartMainCoinObj,
            currTime = mainCoinObj.history.chart.label[mainCoinObj.history.chart.label.length - 1],
            currTime2 = parseInt(
                ((new Date(currTime * 1000).setMinutes(0, 0, 0).valueOf() / 1000) as any).toFixed(
                    0,
                ),
            );

        const grI = DefaultParams.ZOOMPARAMS[zoom].groupByInterval;
        const statWindow = DefaultParams.ZOOMPARAMS[zoom].statsWindow;
        const delta = currTime - currTime2;
        let intrevals = Math.round(delta / grI);
        let newTimefrom = 0;

        if (intrevals * grI + currTime2 > currTime) intrevals--;
        if (intrevals === 0) {
            newTimefrom = currTime2 - grI * (statWindow + 1);
        } else {
            newTimefrom = currTime2 - grI * (statWindow + 1 - intrevals);
        }

        const activeCoin = this.activeCoinName;
        coinsObj[activeCoin].is.chartMain = true;
        coinsObj[activeCoin].is.chartRefresh = true;

        coinsObj[activeCoin].history.timeFrom = newTimefrom - grI;
        coinsObj[activeCoin].history.grByInterval = grI;
        coinsObj[activeCoin].history.data = [];
        coinsObj[activeCoin].history.chart.data = [];
        coinsObj[activeCoin].history.chart.label = mainCoinObj.history.chart.label;

        const coins = this.storageService.coinsList.filter(item => item !== activeCoin);

        coins.forEach(item => {
            coinsObj[item].history.chart.label = [];
            coinsObj[item].is.chartMain = false;
            coinsObj[item].is.chartRefresh = false;
        });
        //this.isLiveLoading = true;

        this.fetchPoolDataService.live({ coin: activeCoin, type: 'pool' });
    }

    private processCoins() {
        const coinI =
            this.storageService.coinsList.length > 2 ? this.storageService.coinsList.length - 1 : 0;
        this.mainChartCoin = this.storageService.coinsList[coinI];
        //this.getLiveInfo();
        this.historyFetcher();
        this.blocksFetch();
    }
    private processLive(coin: string) {
        if (this.isStarting) this.isStarting = false;
        this.isLiveLoading = false;
        this.getHistoryInfo(coin);
        const coinObj = this.storageService.coinsObj[coin];
        if (!coinObj.is.liveVisible) return;
        this.liveStats = coinObj.live.data as any;
    }
    private processBlocks(coin: string) {
        this.isBlocksLoading = false;
        const coinObj = this.storageService.coinsObj[coin];
        if (!coinObj.is.blocksVisible) return;
        this.blocks = coinObj.blocks.data as any;
    }

    //
    private changeMainChartCoin(coin: string) {
        const coinsObj = this.storageService.coinsObj;
        const mainChartCoin = this.storageService.chartMainCoinName;

        coinsObj[coin].is.chartMain = true;
        coinsObj[coin].is.chartRefresh = true;

        coinsObj[coin].history.data = [];
        coinsObj[coin].history.chart.data = [];
        coinsObj[coin].history.chart.label = [];
        coinsObj[coin].history.timeFrom = coinsObj[mainChartCoin].history.timeFrom;
        coinsObj[coin].history.grByInterval = coinsObj[mainChartCoin].history.grByInterval;

        const coins = this.storageService.coinsList.filter(item => item !== coin);

        coins.forEach(item => {
            coinsObj[item].is.chartMain = false;
            coinsObj[item].is.chartRefresh = false;
            coinsObj[item].history.data = [];
            coinsObj[item].history.chart.data = [];
            coinsObj[item].history.chart.label = [];
            coinsObj[item].history.timeFrom = coinsObj[mainChartCoin].history.timeFrom;
            coinsObj[item].history.grByInterval = coinsObj[mainChartCoin].history.grByInterval;
        });
        this.isLiveLoading = true;
        this.fetchPoolDataService.live({ coin: coin, type: 'pool' });
        this.mainChartCoin = coin;
    }

    private getLiveInfo() {
        const coinObj = this.storageService.coinsObj;
        const list = this.storageService.coinsList.filter(coin => {
            return coinObj[coin].is.chartRefresh && !coinObj[coin].live.isLoading;
        });
        list.forEach(coin => {
            if (coinObj[coin].is.liveVisible) this.isLiveLoading = true;
            this.fetchPoolDataService.live({ coin, type: 'pool' });
        });
    }
    private getHistoryInfo(coin: string) {
        const info = this.storageService.coinsObj[coin];
        if (info.history.isLoading || !info.is.chartRefresh) return;
        info.history.isLoading = true;
        this.fetchPoolDataService.history({ coin, type: 'pool' });
    }
    private getBloksInfo() {
        const coinObj = this.storageService.coinsObj;
        const list = this.storageService.coinsList.filter(coin => {
            return (
                !coinObj[coin].is.algo &&
                !coinObj[coin].blocks.isLoading &&
                coinObj[coin].is.blocksVisible
            );
        });
        list.forEach(coin => {
            this.blocks = [];
            coinObj[coin].blocks.isLoading = true;
            this.isBlocksLoading = true;
            this.fetchPoolDataService.blocks({ coin, type: 'pool' });
        });
    }

    private blocksFetch(timer: number = DefaultParams.BLOCKSFETCHTIMER) {
        clearTimeout(this.blocksFetcherTimeoutId);
        this.blocksFetcherTimeoutId = setTimeout(() => {
            this.getBloksInfo();
            this.blocksFetch(timer);
        }, timer * 1000);
    }

    private historyFetcher(
        timer: number = DefaultParams.ZOOMPARAMS[this.storageService.currZoom].refreshTimer,
    ) {
        clearTimeout(this.historyFetcherTimeoutId);
        this.historyFetcherTimeoutId = setTimeout(() => {
            this.getLiveInfo();
            this.historyFetcher();
        }, timer * 1000);
    }

    private setMainCoinTimer(coin: string, timer: number = DefaultParams.BASECOINSWITCHTIMER) {
        clearTimeout(this.changeMainChartCoinTimeoutId);
        this.changeMainChartCoinTimeoutId = setTimeout(() => {
            //this.processZoomChange(this.storageService.currZoom);
            //clearTimeout(this.changeMainChartCoinTimeoutId);
            this.changeMainChartCoin(coin);
        }, timer * 1000);
    }
}
