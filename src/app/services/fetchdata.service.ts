import { Output } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
    IPoolCoinsItem,
    IPoolStatsItem,
    IWorkerStatsItem,
    IFoundBlock,
    IPoolHistoryInfo,
    IPoolStatsHistoryItem,
    IUserHistoryInfo,
    IWorkerHistoryInfo,
    IUserBalanceItem,
    IUserStatsItem,
    IUserStats,
    IHistoryItem,
    //IGetFoundBlocksParams,
    IUserStatsHistoryItem,
    IWorkerStatsHistoryItem,
    //IHistorySettings,
    //ILiveStatSettings,
    //ILiveData,
} from 'interfaces/backend-query';

import { DefaultParams } from 'components/defaults.component';

import {
    IGetUserStatsResponse,
    IGetFoundBlocksParams,
    IGetPoolStatsHistoryParams,
    IGetPoolStatsParams,
    IGetUserStatsHistoryParams,
    IGetUserStatsParams,
    IGetWorkerStatsHistoryParams,
    IGetUserBalanceParams,
} from 'api/backend-query.api';

import { TCoinName } from 'interfaces/coin';
import { Injectable } from '@angular/core';

import {
    ICoinParams,
    IHistoryItem2,
    //    ILiveStatPool,
    //IHistoryItem2,
    //IBlockItem,
    ICoinItem,
    //IZoomParams,
    //ILiveStat,
    //IBlocks,
    ISendLiveStat,
    ISendHistoryStat,
    //    ILiveStatUser, ILiveStatWorker,
    IFetchResponce,
    IHistoryResp,
    IFetchParams,
    ICoinsData,
    ILiveStatCommon,
} from 'interfaces/common';

import { StorageService } from 'services/storage.service';
import {
    BackendQueryApiService,
    IGetPoolStatsResponse,
    //GetUHistory,
} from 'api/backend-query.api';
import { renderFlagCheckIfStmt } from '@angular/compiler/src/render3/view/template';

@Injectable({
    providedIn: 'root',
})
export class FetchPoolDataService {
    //@Output()

    private defResponse = <IFetchResponce>DefaultParams.FETCHRESPONCE;

    private listOfCoinsLoaded = this.defResponse;
    apiGetListOfCoins = new BehaviorSubject<IFetchResponce>(this.listOfCoinsLoaded);

    private listOfBackEndsLoaded = <boolean>false;
    apiGetListOfBackEnds = new BehaviorSubject<boolean>(this.listOfBackEndsLoaded);

    private liveStatLoaded = this.defResponse;
    apiGetLiveStat = new BehaviorSubject<IFetchResponce>(this.liveStatLoaded);
    private historyLoaded = this.defResponse;
    apiGetHistory = new BehaviorSubject<IFetchResponce>(this.historyLoaded);
    private blocksLoaded = this.defResponse;
    apiGetBlocks = new BehaviorSubject<IFetchResponce>(this.blocksLoaded);
    private userBalanceLoaded = this.defResponse;
    apiGetUserBalance = new BehaviorSubject<IFetchResponce>(this.userBalanceLoaded);
    private profitSwitchCoeffLoaded = <boolean>false;
    apiGetProfitSwitchCoeff = new BehaviorSubject<boolean>(this.profitSwitchCoeffLoaded);
    private userSettingsLoaded = this.defResponse;
    apiGetUserSettings = new BehaviorSubject<IFetchResponce>(this.userSettingsLoaded);
    private userCredentialsLoaded = <boolean>false;
    apiGetUserCredentials = new BehaviorSubject<boolean>(this.userCredentialsLoaded);

    private coinsList = <IPoolCoinsItem[]>[];

    //private coinsData = <IDataCoins>{};
    //private liveData = <IDataLive>{};
    //private blocksData = <IDataBlocks>{};
    //private historyData = <IDataHistory>{};

    private coinStat = <IPoolStatsItem>{};
    private coinBlocks = <IFoundBlock[]>[];

    private uStats = <IUserStats>{};
    private uStatsHist = <IUserHistoryInfo>{};
    private uWStatsHist = <IWorkerHistoryInfo>{};
    private uBalances = <IUserBalanceItem[]>[];

    //private uBlocks = <IFoundBlock[]>[];

    getBloksData = new BehaviorSubject<IDataBlocks>(<IDataBlocks>{});
    getCoinsData = new BehaviorSubject<IDataCoins>(<IDataCoins>{});
    getHistoryData = new BehaviorSubject<IDataHistory>(<IDataHistory>{});
    getLiveData = new BehaviorSubject<IDataLive>(<IDataLive>{});

    poolCoinsList = new BehaviorSubject<IPoolCoinsItem[]>(this.coinsList);
    poolCoinStats = new BehaviorSubject<IPoolStatsItem>(this.coinStat);
    poolCoinBlocks = new BehaviorSubject<IFoundBlock[]>(this.coinBlocks);

    subjUStats = new BehaviorSubject<IUserStats>(this.uStats);
    subjUStatsHist = new BehaviorSubject<IUserHistoryInfo>(this.uStatsHist);
    subjUWStatsHist = new BehaviorSubject<IWorkerHistoryInfo>(this.uWStatsHist);
    subjUBalance = new BehaviorSubject<IUserBalanceItem[]>(this.uBalances);
    /*
    fetchCoins(forceUpdate?: boolean | false) {
        const storage = this.storageService;
        if (forceUpdate) {
            this.backendQueryApiService.getPoolCoins().subscribe(({ coins }) => {
                coins = sort(coins);
                storage.whatCoins = coins;
                this.getCoinsData.next({ msg: coins });
            });
        } else {
            if (storage.whatCoins.length !== 0) {
                const resp = { msg: storage.whatCoins, fromCache: true };
                this.getCoinsData.next(resp);
            } else this.fetchCoins(true);
        }

        function sort(coins) {
            let algo = true,
                newList = [] as IPoolCoinsItem[];
            coins.forEach(coin => {
                addCoinToList(coin, coin.name === 'BTC');
                algo ? (algo = coins[0].algorithm === coin.algorithm) : true;
                initCoinsData(coin.name);
            });
            if (algo) {
                const a = coins[0].algorithm;
                addCoinToList({
                    name: a,
                    fullName: a,
                    algorithm: a,
                });
            }
            return newList;
            function addCoinToList(coin: IPoolCoinsItem, btc: boolean = false) {
                if (!btc) newList.push(coin);
                else newList.unshift(coin);
                initCoinsData(coin.name);
            }
            function initCoinsData(coin: TCoinName) {
                storage.isChartsLoaded[coin] = false;
                storage.chartData[coin] = {
                    title: coin,
                    actualData: [],
                    prevData: [],
                };
            }
        }
    }
*/
    coins(params: IFetchParams): void {
        const storage = this.storageService;
        if (params.forceUpdate) {
            this.backendQueryApiService.getPoolCoins().subscribe(
                ({ coins }) => {
                    storage.coinsList = [];
                    coins = sort(coins);
                    storage.coinsListTs = getTs();
                    this.apiGetListOfCoins.next({ status: true, coin: '', type: params.type });
                },
                () => {
                    this.apiGetListOfCoins.next({ status: false, coin: '', type: params.type });
                },
            );
        } else {
            this.coins(params);
            /*const ts = storage.coinsListTs;
            if (ts !== 0 && ts + 24 * 60 * 60 < getTs()) {
                this.apiGetListOfCoins.next(true);
            } else this.coins(true);*/
        }

        function sort(coins): ICoinItem[] {
            let algo = true,
                newList = [] as ICoinItem[];
            const ts = getTs();
            coins.forEach(coin => {
                addCoinToList(coin, coin.name === 'BTC');
                algo ? algo && coins[0].algorithm === coin.algorithm : true;
            });
            if (algo) {
                const a = coins[0].algorithm;
                addCoinToList({ name: a, fullName: a, algorithm: a });
            }
            return newList;
            function addCoinToList(coin: ICoinItem, isBtc: boolean = false): void {
                if (!isBtc) newList.push(coin);
                else newList.unshift(coin);
                const isAlgo = coin.name === coin.algorithm;
                let isSpliName = false;
                if (coin.name.split('.').length > 1) {
                    coin.name = coin.name.split('.')[0];
                    isSpliName = true;
                }
                const state = { isLoading: false, cacheTs: 0 };
                const blocksState = { data: [], ...state };
                const liveState = { data: {} as any, ...state };
                const histState = {
                    data: [],
                    timeFrom: 0,
                    grByInterval: storage.currZoomGroupByInterval,
                    chart: { data: [], label: [], datasetI: -1 },
                    ...state,
                };
                const user = { balance: [], isBalanceLoading: false, isSettingsLoading: false };
                const store: ICoinParams = {
                    info: coin,
                    isMain: false,
                    isAlgo,
                    isSpliName,
                    isNeedRefresh: false,
                    blocks: blocksState,
                    live: liveState,
                    history: histState,
                    user: user as any,
                };
                storage.coinsObj[coin.name] = store;
                storage.coinsList.push(coin.name);
            }
        }
        function getTs(): number {
            return parseInt(((new Date().valueOf() / 1000) as any).toFixed(0));
        }
    }
    live(params: IFetchParams): void {
        const isParamsValid = params.coin !== '' && params.type !== '';
        if (!isParamsValid) return;

        const storage = this.storageService.coinsObj[params.coin],
            sendResult = this.apiGetLiveStat;

        if (params.forceUpdate) {
            const api = this.backendQueryApiService;
            let coinName = params.coin,
                ts = 0;
            if (storage.isSpliName) coinName = params.coin + '.' + storage.info.algorithm;
            const apiRequest = { coin: coinName };
            switch (params.type) {
                case 'worker':
                case 'user':
                    api.getUserStats(apiRequest).subscribe(
                        ({ total, powerMultLog10, workers, currentTime }) => {
                            if (!this.storageService.locatTimeDelta.isUpdated) {
                                const ts = getTs();
                                const delta = ts - currentTime;
                                let data = { delta: 0, isUpdated: true };
                                if (Math.abs(delta) > 0) data.delta = delta;
                                this.storageService.locatTimeDelta = data;
                            }
                            const delta = this.storageService.locatTimeDelta.delta;

                            workers.forEach(item => {
                                item.lastShareTime = delta + currentTime - item.lastShareTime;
                            });
                            workers.sort((a, b) => {
                                return b.lastShareTime - a.lastShareTime;
                            });
                            const stats: ILiveStatCommon = {
                                powerMultLog10: powerMultLog10,
                                clients: total.clients,
                                workers: total.workers,
                                miners: workers,
                                shareRate: total.shareRate,
                                shareWork: total.shareWork,
                                power: total.power,
                                lastShareTime: total.lastShareTime,
                            };
                            ts = getTs();
                            storeAndSend({ coin: params.coin, stats, status: true });
                        },
                        () => {
                            storeAndSend({
                                coin: params.coin,
                                stats: DefaultParams.NULLSTATUSERLIVEITEM,
                                status: false,
                            });
                        },
                    );
                    break;
                case 'pool':
                default:
                    api.getPoolStats(apiRequest).subscribe(
                        ({ stats }) => {
                            ts = getTs();
                            storeAndSend({ coin: params.coin, stats: stats[0], status: true });
                        },
                        () => {
                            storeAndSend({
                                coin: params.coin,
                                stats: DefaultParams.NULLSTATLIVEITEM,
                                status: false,
                            });
                        },
                    );
                //return;
            }
            function storeAndSend(info: ISendLiveStat): void {
                storage.live.data = info.stats;
                storage.live.isLoading = false;
                storage.live.cacheTs = ts;
                sendResult.next({ status: info.status, coin: info.coin, type: params.type });
            }
        } else {
            /*
            const ts = storage.live.cacheTs;
            const currZoom = this.storageService.currZoom;
            const maxTimeLiveCashe = 0; //DefaultParams.LIVESTATCACHE;
            const maxTimeLiveCasheZoom = 0; //DefaultParams.ZOOMPARAMS[currZoom].refreshTimer - 1;
            const maxTsDelta = Math.min(maxTimeLiveCashe, maxTimeLiveCasheZoom);
            if (ts !== 0 && ts + maxTsDelta < getTs()) {
                this.storageService.coinsObj[params.coin].live.isLoading = false;
                sendResult.next({ status: true, coin: params.coin });
            } else*/
            this.live({
                coin: params.coin,
                type: params.type,
                forceUpdate: true,
            });
        }
        function getTs(): number {
            return parseInt(((new Date().valueOf() / 1000) as any).toFixed(0));
        }
    }

    history(params: IFetchParams) {
        const isParamsValid = params.coin !== '' && params.type !== '';
        if (!isParamsValid) return;
        const storage = this.storageService,
            sendResult = this.apiGetHistory;
        const coinObj = storage.coinsObj[params.coin];

        if (params.forceUpdate) {
            const api = this.backendQueryApiService;
            let coinName = params.coin;

            if (coinObj.isSpliName) coinName = params.coin + '.' + coinObj.info.algorithm;
            let apiReq = {} as {
                coin: string;
                timeFrom: number;
                groupByInterval: number;
                timeTo?: number;
                workerId?: string;
            };
            apiReq.coin = coinName;
            const mainCoin = storage.mainCoin;
            const mainCoinObj = storage.coinsObj[mainCoin];
            //apiReq.groupByInterval = mainCoinObj.history.grByInterval;
            apiReq.groupByInterval = storage.currZoomGroupByInterval;

            let lMainCoin = mainCoinObj.history.chart.label.length;
            let lCoin = coinObj.history.chart.label.length;
            /*if (params.coin !== mainCoin) {
                //apiReq.groupByInterval = mainCoinObj.history.grByInterval;
                apiReq.timeTo =
                    mainCoinObj.history.chart.label[lMainCoin - 1] + apiReq.groupByInterval;
            }*/
            if (lMainCoin === 0) {
                apiReq.timeFrom = storage.currZoomTimeFrom;
                apiReq.groupByInterval = storage.currZoomGroupByInterval;
            } else if (lCoin === 0) {
                apiReq.timeFrom = mainCoinObj.history.chart.label[0] - 2 * apiReq.groupByInterval;
            } else {
                apiReq.timeFrom = mainCoinObj.history.chart.label[lMainCoin - 5];
            }
            // +
            //apiReq.groupByInterval;

            switch (params.type) {
                case 'worker':
                    if (params.workerId === '') return;
                    apiReq.workerId = params.workerId;
                    api.getWorkerStatsHistory(apiReq as any).subscribe(
                        (historyResponce: IHistoryResp) => {
                            if (historyResponce.stats.length > 1) historyResponce.stats.shift();
                            processResponce(historyResponce);
                        },
                        () => {
                            processErr();
                        },
                    );
                    break;
                case 'user':
                    api.getUserStatsHistory(apiReq as any).subscribe(
                        (historyResponce: IHistoryResp) => {
                            if (historyResponce.stats.length > 1) historyResponce.stats.shift();
                            processResponce(historyResponce);
                        },
                        () => {
                            processErr();
                        },
                    );
                    break;
                case 'pool':
                default:
                    api.getPoolStatsHistory(apiReq).subscribe(
                        (historyResponce: IHistoryResp) => {
                            if (historyResponce.stats.length > 1) historyResponce.stats.shift();
                            processResponce(historyResponce);
                        },
                        () => {
                            processErr();
                        },
                    );
            }
            function processResponce(historyResponce: IHistoryResp) {
                if (!storage.locatTimeDelta.isUpdated) {
                    const ts = getTs();
                    const delta = ts - historyResponce.currentTime;
                    let data = { delta: 0, isUpdated: true };
                    if (Math.abs(delta) > 0) data.delta = delta;
                    storage.locatTimeDelta = data;
                }

                let histData = fixHistory(historyResponce);

                calcChartsData(histData);

                coinObj.history.data = histData.stats;
                coinObj.history.isLoading = false;
                coinObj.history.cacheTs = historyResponce.currentTime;
                sendResult.next({ status: true, coin: params.coin, type: params.type });
            }
            function processErr() {
                coinObj.history.isLoading = false;
                sendResult.next({
                    status: false,
                    coin: params.coin,
                    type: params.type,
                });
            }

            function fixHistory(data: IHistoryResp): IHistoryResp {
                const grInterval = apiReq.groupByInterval;
                let time = data.currentTime,
                    timeFrom = apiReq.timeFrom;

                if (data.stats.length === 0) {
                    let nullStat = DefaultParams.NULLSTATHISTORYITEM;
                    nullStat.time = timeFrom;
                    data.stats.push(nullStat);
                }

                //const maxIterations = 1000;
                //let count = 0;

                while (data.stats[0].time - timeFrom > 2 * grInterval) {
                    //let nullStat = DefaultParams.NULLSTATHISTORYITEM;
                    //nullStat.time = ;
                    data.stats.unshift({
                        name: '',
                        time: data.stats[0].time - grInterval,
                        shareRate: 0,
                        shareWork: 0,
                        power: 0,
                    });
                }
                while (data.stats[data.stats.length - 1].time + grInterval < time) {
                    //let nullStat = DefaultParams.NULLSTATHISTORYITEM;
                    //nullStat.time =
                    //data.stats[data.stats.length - 1].time + grInterval;
                    data.stats.push({
                        name: '',
                        time: data.stats[data.stats.length - 1].time + grInterval,
                        shareRate: 0,
                        shareWork: 0,
                        power: 0,
                    });
                }

                if (data.stats[data.stats.length - 1].time < time) {
                    if (data.stats[data.stats.length - 1].power === 0) {
                        data.stats.push({
                            name: '',
                            time,
                            shareRate: 0,
                            shareWork: 0,
                            power: 0,
                        });
                    } else {
                        data.stats.push({
                            name: '',
                            time,
                            shareRate: 0,
                            shareWork: 0,
                            power: coinObj.live.data.power,
                        });
                    }
                }
                if (data.stats[data.stats.length - 1].time > time) {
                    data.stats[data.stats.length - 1].time = time;
                    data.stats[data.stats.length - 1].power = coinObj.live.data.power;
                }
                return data;
            }
            function calcChartsData(data: IHistoryResp): void {
                data.stats.forEach(el => {
                    el.power = el.power / Math.pow(10, 15 - data.powerMultLog10);
                });
                //coinObj.history.data = data.stats;
            }
        } else {
            /*
            const ts = storage.coinsObj[params.coin].history.cacheTs;
            const currZoom = this.storageService.currZoom;
            const maxTimeHistoryCashe = 0; // DefaultParams.HISTORYSTATCACHE;
            const maxTimeHistoryCasheZoom = 0; //DefaultParams.ZOOMPARAMS[currZoom].refreshTimer - 1;
            const maxTsDelta = Math.min(maxTimeHistoryCashe, maxTimeHistoryCasheZoom);
            if (ts !== 0 && ts + maxTsDelta < getTs() + storage.locatTimeDelta.delta) {
                storage.coinsObj[params.coin].history.isLoading = false;
                sendResult.next({ status: true, coin: params.coin });
            //} else {*/
            let req = {} as IFetchParams;
            (req.coin = params.coin), (req.type = params.type), (req.forceUpdate = true);
            if (params.workerId) req.workerId = params.workerId;
            this.history(req);
            //}
        }
        function getTs() {
            return parseInt(((new Date().valueOf() / 1000) as any).toFixed(0));
        }
    }

    blocks(params: IFetchParams) {
        if (params.coin === '' || this.storageService.coinsObj[params.coin].isAlgo) return;
        if (params.forceUpdate) {
            const store = this.storageService.coinsObj[params.coin];
            let reqCoin = params.coin;
            if (store.isSpliName) reqCoin = params.coin + '.' + store.info.algorithm;

            let req = {} as IGetFoundBlocksParams;
            req.coin = reqCoin;
            if (params.heightFrom) req.heightFrom = params.heightFrom;
            if (params.count) req.count = params.count;
            if (params.hashFrom) req.hashFrom = params.hashFrom;

            this.backendQueryApiService.getFoundBlocks(req).subscribe(
                ({ blocks }) => {
                    if (params.type === 'user') {
                        blocks.filter(block => {
                            return block.foundBy === params.user;
                        });
                    }
                    this.storageService.coinsObj[params.coin].blocks.data = blocks;
                    this.storageService.coinsObj[params.coin].blocks.isLoading = false;
                    this.storageService.coinsObj[params.coin].blocks.cacheTs = getTs();
                    this.apiGetBlocks.next({ status: true, coin: params.coin, type: params.type });
                },
                () => {
                    this.storageService.coinsObj[params.coin].blocks.data = [];
                    this.storageService.coinsObj[params.coin].blocks.isLoading = false;
                    this.storageService.coinsObj[params.coin].blocks.cacheTs = getTs();
                    this.apiGetBlocks.next({ status: true, coin: params.coin, type: params.type });
                },
            );
        } else {
            /* const ts = this.storageService.coinsObj[params.coin].history.cacheTs;
            const currZoom = this.storageService.currZoom;
            const maxTimeHistoryCashe = DefaultParams.HISTORYSTATCACHE;
            const maxTimeHistoryCasheZoom = DefaultParams.ZOOMPARAMS[currZoom].refreshTimer - 1;
            const maxTsDelta = Math.min(maxTimeHistoryCashe, maxTimeHistoryCasheZoom);
            this.storageService.coinsObj[params.coin].blocks.isLoading = false;
            if (ts !== 0 && ts + maxTsDelta < getTs()) {
                this.apiGetBlocks.next({ status: true, coin: params.coin });
            } else {*/
            let req = {} as IFetchParams;
            req.coin = params.coin;
            req.type = params.type;
            req.forceUpdate = true;
            if (params.user) req.user = params.user;
            if (params.hashFrom) req.hashFrom = params.hashFrom;
            if (params.heightFrom) req.heightFrom = params.heightFrom;
            this.blocks(req);
            //}
        }
        function getTs() {
            return parseInt(((new Date().valueOf() / 1000) as any).toFixed(0));
        }
    }

    balance(params: IFetchParams) {
        if (params.coin === '' || this.storageService.coinsObj[params.coin].isAlgo) return;
        const store = this.storageService.coinsObj[params.coin];
        let reqCoin = params.coin;
        if (store.isSpliName) reqCoin = params.coin + '.' + store.info.algorithm;

        let req = {} as IGetUserBalanceParams;
        req.coin = reqCoin;

        this.backendQueryApiService.getUserBalance(req).subscribe(
            ({ balances }) => {
                this.storageService.coinsObj[params.coin].user.balance = balances[0];
                this.storageService.coinsObj[params.coin].user.isBalanceLoading = false;
                this.apiGetUserBalance.next({ status: true, coin: params.coin, type: params.type });
            },
            () => {
                this.storageService.coinsObj[params.coin].user.balance = {} as any;
                this.storageService.coinsObj[params.coin].user.isBalanceLoading = false;
                this.apiGetUserBalance.next({
                    status: false,
                    coin: params.coin,
                    type: params.type,
                });
            },
        );
    }
    constructor(
        private storageService: StorageService,
        private backendQueryApiService: BackendQueryApiService,
    ) {}

    private tNow(): number {
        return ((new Date().valueOf() / 1000) as any).toFixed(0);
    }
}

export interface ICoinsInfo {}

export interface IFetchBlocks {
    coin: TCoinName;
    user?: string;
    heightFrom?: number;
    hashFrom?: string;
    count?: number;
}

export interface IFetchHistory {
    type: string;
    coin: TCoinName;
    isBaseCoin: boolean;
    liveStat: IPoolStatsItem | IUserStatsItem | IWorkerStatsItem;
    userId?: string;
    workerId?: string;
    //groupByInterval?: number;
    //statsWindow?: number;
    timeFrom?: number;
    powerMultLog10?: number;
}

export interface IFetchLive {
    type: string;
    coin: TCoinName;
    userId?: string;
    workerId?: string;
}

export interface IFixStatsData {
    stats: IHistoryItem[];
    timeFrom: number;
    currentTime: number;
    groupByInterval: number;
    statsWindow: number;
    liveStats: IPoolStatsItem | IUserStatsItem | IWorkerStatsItem;
    workerId?: string;
    powerMultLog10?: number;
    lastShareTime?: number;
}

export interface IDataBlocks {
    msg: IFoundBlock[];
    settings: IFetchBlocks;
}

export interface IDataCoins {
    msg: IPoolCoinsItem[];
    fromCache?: boolean;
}

export interface IDataHistory {
    msg: IPoolHistoryInfo;
    settings: IFetchHistory;
}

export interface IDataLive {
    msg: IPoolStatsItem | IUserStatsItem | IWorkerStatsItem;
    settings: IFetchLive;
}
