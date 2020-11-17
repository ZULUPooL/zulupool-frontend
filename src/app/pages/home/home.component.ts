import { Component, OnInit } from "@angular/core";
import { SubscribableComponent } from "ngx-subscribable";

import { StorageService } from "services/storage.service";
import { not } from "logical-not";

import { EAppRoutes, userRootRoute } from "enums/routing";
import { BackendQueryApiService } from "api/backend-query.api";
import {
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
} from "interfaces/backend-query";
import { ESuffix } from "pipes/suffixify.pipe";
import { TCoinName } from "interfaces/coin";
//import { CoinSwitcherComponent } from "components/coin-switcher/coin-switcher.component";
import { ZoomSwitchService } from "services/zoomswitch.service";
import {
    FetchPoolDataService,
    IDataBlocks,
    IDataCoins,
    IDataHistory,
    IDataLive,
    //IFetchCoins,
    IFetchBlocks,
    IFetchHistory,
    IFetchLive,
    ICoinsInfo,
} from "services/fetchdata.service";
import { statusCommonResp } from "enums/api-enums";
import { SettingsComponent } from "pages/settings/settings.component";
import { from } from "rxjs";
import { renderFlagCheckIfStmt } from "@angular/compiler/src/render3/view/template";

//import { global } from '@angular/compiler/src/util';
//import { ETime } from "enums/time";

@Component({
    selector: "app-home",
    templateUrl: "./home.component.html",
    styleUrls: ["./home.component.less"],
})
export class HomeComponent extends SubscribableComponent implements OnInit {
    readonly EAppRoutes = EAppRoutes;
    readonly ESuffix = ESuffix;

    get isLiveStatLoading(): boolean {
        return (
            !this.isStarting &&
            this.coinsData[this.currentCoinName].live.isLoading
        );
    }

    get isBloksLoading(): boolean {
        return (
            !this.isStarting &&
            this.coinsData[this.currentCoinName].blocks.isLoading
        );
    }

    //chartDataReady: boolean;
    currentCoinName: TCoinName;
    currentAlgo: TCoinName;
    currentStats: IPoolStatsItem;
    currentHistory: IWorkerStatsItem[];
    //currentPowerMultLog10: number;

    powerChartData: {
        actualData: IPoolStatsHistoryItem[];
        powerMultLog10: number;
        chartName: string;
        prevData: IPoolStatsHistoryItem[];
        clear: boolean;
        zoom: boolean;
    };

    currentBlocks: IFoundBlock[];
    coinsData: ICoinsInfo = {} as ICoinsInfo;

    isStarting = true;

    foundBlockKeys: (keyof IFoundBlock)[] = [
        "height",
        "hash",
        "confirmations",
        "generatedCoins",
        "foundBy",
        "time",
    ];
    foundBlockKeysMobile: (keyof IFoundBlock)[] = [
        "height",
        "hash",
        "confirmations",
        "foundBy",
    ];

    signUpLink = {
        href: `/${EAppRoutes.Auth}`,
        params: {
            to: decodeURIComponent(`/${userRootRoute}`),
            registration: true,
        },
    };

    private coinsList: IPoolCoinsItem[] = [];
    private clearChart = false;
    private clearZoom = false;
    private timer: number = 0;
    private timeToSetNewBase: number = 90;
    private isZoomStarting: boolean;
    private explorersLinksPref = {
        BTC: "https://btc.com/",
        BCH: "https://bch.btc.com/",
        BSV: "https://whatsonchain.com/block/",
        "DGB.sha256": "https://chainz.cryptoid.info/dgb/block.dws?",
        FCH: "http://fch.world/block/",
        HTR: "https://explorer.hathor.network/transaction/",
    };

    private updateTimeoutId: number;

    constructor(
        //        private coinSwitchService: CoinSwitchService,
        //private coinSwitcherComponent: CoinSwitcherComponent,
        private zoomSwitchService: ZoomSwitchService,
        private fetchPoolDataService: FetchPoolDataService,
        private storageService: StorageService,
    ) {
        super();
    }

    ngOnInit(): void {
        this.subscriptions = [
            /*
            this.coinSwitchService.coinSwitch.subscribe(coinName => {
                this.processCoinSwitch(coinName);
            }),
            */
            this.zoomSwitchService.zoomSwitch.subscribe(zoom => {
                if (zoom !== "" && !this.isZoomStarting)
                    this.processZoomSwitch(zoom);
            }),

            this.fetchPoolDataService.getCoinsData.subscribe(data => {
                if (Object.keys(data).length !== 0) this.processCoins(data);
            }),
            this.fetchPoolDataService.getLiveData.subscribe(data => {
                if (Object.keys(data).length !== 0) this.processLive(data);
            }),
            this.fetchPoolDataService.getHistoryData.subscribe(data => {
                if (Object.keys(data).length !== 0) this.processHistory(data);
                if (this.isZoomStarting) this.isZoomStarting = false;
            }),
            this.fetchPoolDataService.getBloksData.subscribe(data => {
                if (Object.keys(data).length !== 0) this.processBlocks(data);
            }),
        ];
        this.reset();
        this.isStarting = true;
        this.isZoomStarting = true;
        //this.chartDataReady = false;
        this.fetchPoolDataService.fetchCoins();
        this.periodicCall();
        //this.currentChartData = {
        //  chartName: "",
        //stats: [],
        //powerMultLog10: 6,
        //};
    }

    ngOnDestroy(): void {
        clearTimeout(this.updateTimeoutId);
        this.subscriptions.forEach(el => el.unsubscribe);
        //this.storageService.chartsBaseData = null;
        this.unsetFetch();
        //this.reset();
    }

    onBlockClick(block: IFoundBlock): void {
        const url = this.explorersLinksPref[this.currentCoinName] + block.hash;
        window.open(url, "_system");
    }

    onCurrentCoinChange(coin: TCoinName | null): void {
        if (coin === null) return;
        //this.clearChart = false;
        if (this.coinsData[coin].info.isBase) {
            this.coinsList.forEach(el => {
                if (el.name !== coin)
                    this.coinsData[el.name].info.needFetch = false;
            });
            this.clearChart = true;
            this.timer = 0;
        } else {
            this.coinsData[coin].info.needFetch = true;
            const ts = parseInt(
                ((new Date().valueOf() / 1000) as any).toFixed(0),
            );
            this.timer = ts;
        }
        this.currentCoinName = coin;

        const info = this.storageService.whatCoins.find(item => {
            return item.name === coin;
        });
        this.storageService.currentCoinInfo = info;
        this.storageService.whatCoin = info;
        //this.setFetch(coin);
        if (!this.coinsData[this.currentCoinName].info.isBase)
            this.startLiveFetch(this.storageService.whatBase.name);
        this.startLiveFetch(coin);
        this.periodicCall();

        //if (coinName === "" || this.loading.coins) return;
        //this.fetchData();
        //this.startLiveFetch(coin);
        //this.periodicCall();
    }

    truncate(fullStr) {
        let s = { sep: "....", front: 3, back: 7 };
        return (
            fullStr.substr(0, s.front) +
            s.sep +
            fullStr.substr(fullStr.length - s.back)
        );
    }

    private processZoomSwitch(zoom: string) {
        if (this.isZoomStarting) return;
        const coin = this.currentCoinName;
        this.storageService.whatZoom = zoom;
        this.storageService.whatCoins.forEach(el => {
            this.storageService.chartData[el.name].actualData = [];
            this.storageService.chartData[el.name].prevData = [];
            this.storageService.chartData[el.name].timeFrom = 0;
            this.storageService.chartData[el.name].firstTime = 0;
            this.storageService.chartData[el.name].lastTime = 0;
            if (el.name === coin) {
                this.setupCoins(el, false, true);
                this.storageService.isZoomLoading[el.name] = true;
            } else {
                this.setupCoins(el, false, true);
                this.storageService.isZoomLoading[el.name] = false;
            }
        });

        this.clearChart = true;
        this.clearZoom = true;

        this.startLiveFetch(coin);
        //debugger;
    }

    private processBlocks(data: IDataBlocks) {
        const coin = data.settings.coin;
        this.coinsData[coin].blocks.data = data.msg;
        this.coinsData[coin].blocks.isLoading = false;
        if (coin == this.currentCoinName) {
            this.currentBlocks = data.msg;
        }
        //this.updateUserOutput();
    }

    private processCoins(data: IDataCoins) {
        if (data.msg.length > 0) {
            let list = data.msg.reverse();
            list.forEach(item => {
                this.setupCoins(
                    item,
                    list.length === 1 ? true : item.name === item.algorithm,
                );
            });
            list.reverse();
            const coinI = list.length > 2 ? list.length - 1 : 0;
            this.currentCoinName = list[coinI].name;
            this.currentAlgo = list[coinI].algorithm;
            this.storageService.currentCoinInfo = list[coinI];
            this.storageService.whatCoins = list;
            this.startLiveFetch(this.currentCoinName);
        }
        //this.updateUserOutput();
    }

    private processHistory(data: IDataHistory) {
        const coin = data.settings.coin;
        if (Object.keys(data.msg).length > 0) {
            const hist = {
                data: data.msg.stats,
                timeFrom: data.settings.timeFrom,
                powerMultLog10: data.settings.powerMultLog10,
                isLoading: false,
            };
            this.coinsData[coin].hist = hist;
            if (this.coinsData[coin].info.isBase) this.setTfom(hist.timeFrom);
            if (this.coinsData[coin].info.needFetch)
                this.setChartsData(data, coin);
            const c = this.storageService.whatBase.name;
            if (this.storageService.isZoomLoading[c] && coin === c) {
                this.storageService.isZoomLoading[c] = false;
                this.setChartsData(data, coin);
            }
        } //else this.startHistoryFetch(data.settings);
        //this.updateUserOutput();
    }
    /*
    private set1Fetch(coin: TCoinName) {
        if (this.coinsData[coin].info.isBase) {
            for (let i in this.coinsList) {
                const coinName = this.coinsList[i].name;
                if (!this.coinsData[coinName].info.isBase)
                    this.coinsData[coinName].info.needFetch = false;
            }
        } else {
            const bool = this.coinsData[coin].info.needFetch;
            this.coinsData[coin].info.needFetch = !bool;
        }
    }*/
    private unsetFetch() {
        for (let i in this.coinsList) {
            const coinName = this.coinsList[i].name;
            //if (!this.coinsData[coinName].info.isBase)
            this.coinsData[coinName].info.needFetch = false;
        }
    }

    private setChartsData(data, coin) {
        this.powerChartData = {
            actualData: data.msg,
            powerMultLog10: data.settings.powerMultLog10,
            chartName: coin,
            prevData: this.storageService.chartData[coin].prevData,
            clear: this.clearChart,
            zoom: this.clearZoom,
        };
        if (this.clearChart && this.storageService.whatBase.name === coin)
            this.clearChart = false;
        if (this.clearZoom && this.storageService.whatBase.name === coin)
            this.clearZoom = false;
    }

    private setTfom(tFrom: number) {
        for (let i in this.coinsList) {
            const coin = this.coinsList[i].name;
            if (!this.coinsData[coin].info.isBase)
                this.coinsData[coin].hist.timeFrom = tFrom;
        }
    }

    private processLive(data: IDataLive) {
        const coin = data.settings.coin;
        const msg = data.msg as IPoolStatsItem;
        if (Object.keys(data.msg).length > 0) {
            this.coinsData[coin].live = {
                data: data.msg,
                isLoading: false,
            };
            this.coinsList.find(item => {
                if (item.name === coin)
                    item.powerMultLog10 = msg.powerMultLog10;
            });
            //debugger;
            this.startHistoryFetch(coin);
            if (coin === this.currentCoinName)
                this.currentStats = data.msg as IPoolStatsItem;

            const ts = parseInt(
                ((new Date().valueOf() / 1000) as any).toFixed(0),
            );
            //debugger;
            if (this.timer > 0 && this.timer + this.timeToSetNewBase < ts) {
                this.timer = 0;
                this.coinsList.forEach(el => {
                    if (el.name !== this.currentCoinName) {
                        this.coinsData[el.name].info.needFetch = false;
                        this.coinsData[el.name].info.isBase = false;
                    } else {
                        this.coinsData[el.name].info.needFetch = true;
                        this.coinsData[el.name].info.isBase = true;
                        this.storageService.whatBase = this.coinsData[
                            el.name
                        ].info.data;
                        this.clearChart = true;
                    }
                });
                const baseC = this.storageService.whatBase.name;
                this.onCurrentCoinChange(baseC);
            }
            if (this.coinsData[coin].info.needFetch)
                this.startBlocksFetch(coin);
        } //else this.startLiveFetch(data.settings);
    }

    private setupCoins(
        coinInfo: IPoolCoinsItem,
        bool: boolean,
        zoom: boolean = false,
    ) {
        const info = {
            data: coinInfo,
            needFetch: bool,
            isBase: bool,
            isAlgo: coinInfo.name === coinInfo.algorithm,
        };
        const live = {
            data: {} as IPoolStatsItem,
            isLoading: false,
        };
        const hist = {
            data: [] as IPoolStatsHistoryItem[],
            timeFrom: 0,
            powerMultLog10: null,
            isLoading: false,
        };
        const blocks = {
            data: [] as IFoundBlock[],
            isLoading: false,
        };
        if (!bool) {
            const baseC = this.storageService.whatBase.name;
            hist.timeFrom = this.coinsData[baseC].hist.timeFrom;
        }
        if (zoom) {
            this.coinsData[coinInfo.name] = { info, live, hist, blocks };
        } else {
            if (bool) this.storageService.whatBase = coinInfo;
            this.coinsList.push(coinInfo);
            this.coinsData[coinInfo.name] = { info, live, hist, blocks };

            this.storageService.isZoomLoading[coinInfo.name] = false;
        }
    }
    /*
    private getBaseCo1inTimeFrom() {
        for (let i in this.coinsList) {
            const coin = this.coinsList[i].name;
            if (this.coinsData[coin].info.isBase)
                return this.coinsData[coin].hist.timeFrom;
        }
    }
*/
    private startLiveFetch(coin: TCoinName) {
        if (this.coinsData[coin].live.isLoading) return;
        const settings: IFetchLive = { type: "coin", coin };
        this.coinsData[coin].live.isLoading = true;
        this.fetchPoolDataService.fetchLiveStat(settings);
    }

    private startHistoryFetch(coin: TCoinName) {
        if (this.coinsData[coin].hist.isLoading) return;
        const baseC = this.storageService.whatBase.name;
        let tFrom = this.coinsData[baseC].hist.timeFrom;

        const settings = {
            type: "coin",
            coin: coin,
            isBaseCoin: this.coinsData[coin].info.isBase,
            liveStat: this.coinsData[coin].live.data,
            timeFrom: tFrom,
        };

        this.coinsData[coin].hist.isLoading = true;
        this.fetchPoolDataService.fetchHistory(settings as any);
    }

    private startBlocksFetch(coin: TCoinName) {
        if (
            this.coinsData[coin].info.isAlgo ||
            this.coinsData[coin].blocks.isLoading
        )
            return;
        this.coinsData[coin].blocks.isLoading = true;
        this.fetchPoolDataService.fetchBlocks({ coin });
    }

    private fetchData() {
        for (let i in this.coinsList) {
            const coin = this.coinsList[i].name;
            if (this.coinsData[coin].info.needFetch) this.startLiveFetch(coin);
        }
    }

    private periodicCall() {
        clearTimeout(this.updateTimeoutId);
        this.updateTimeoutId = setTimeout(() => {
            this.fetchData();
            this.periodicCall();
        }, 15 * 1000);
    }

    private reset() {
        //this.storageService.poolCoins = null;
        this.storageService.poolCoinsliveStat = null;
        this.storageService.currentCoinInfo = null;
        this.storageService.chartsTimeFrom = null;
        // this.storageService.chartsBaseData = null;

        this.storageService.sessionId = null;
        this.storageService.targetLogin = null;
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
