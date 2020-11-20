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
    @Output()
    private defResponse = <IFetchResponce>DefaultParams.FETCHRESPONCE;

    private listOfCoinsLoaded = <boolean>false;
    apiGetListOfCoins = new BehaviorSubject<boolean>(this.listOfCoinsLoaded);
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

    coins(forceUpdate?: boolean | false): void {
        const storage = this.storageService;
        if (forceUpdate) {
            this.backendQueryApiService.getPoolCoins().subscribe(
                ({ coins }) => {
                    coins = sort(coins);
                    storage.coinsListTs = getTs();
                    this.apiGetListOfCoins.next(true);
                },
                () => {
                    this.apiGetListOfCoins.next(false);
                },
            );
        } else {
            const ts = storage.coinsListTs;
            if (ts !== 0 && ts + 24 * 60 * 60 < getTs()) {
                this.apiGetListOfCoins.next(true);
            } else this.coins(true);
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
                const store: ICoinParams = {
                    info: coin,
                    isMain: false,
                    isAlgo,
                    isSpliName,
                    isNeedRefresh: false,
                    blocks: blocksState,
                    live: liveState,
                    history: histState,
                };
                storage.coinsObj[coin.name] = store;
                storage.coinsList.push(coin.name);
            }
        }
        function getTs(): number {
            return parseInt(((new Date().valueOf() / 1000) as any).toFixed(0));
        }
    }

    fetchLiveStat(settings: IFetchLive) {
        const back = this.backendQueryApiService;
        const sendData = this.getLiveData;

        if (!isValidLiveParams()) return;

        let req = { coin: settings.coin },
            response: IDataLive = {
                msg: {} as IPoolStatsItem | IUserStatsItem | IWorkerStatsItem,
                settings,
            };

        switch (settings.type) {
            case 'worker':
                if (settings.workerId === null) return;
                break;
            case 'user':
                if (settings.userId === null) return;
                getUserStats(req);
                break;
            case 'coin':
            default:
                getPoolStats(req);
                return;
        }
        return;
        function getPoolStats(req) {
            back.getPoolStats(req).subscribe(({ stats }) => {
                sendLiveStat(stats[0]);
            });
        }
        function getUserStats(req) {
            back.getUserStats(req).subscribe((stats: IGetUserStatsResponse) => {
                sendLiveStat(this.processWorkersData(stats));
            });
        }
        function getWorkerStats(req) {
            sendLiveStat('TODO');
        }
        function sendLiveStat(liveStat) {
            const data = { msg: liveStat, settings };
            sendData.next(data);
        }

        function isValidLiveParams(): boolean {
            return !(
                Object.keys(settings).length === 0 ||
                settings.type === null ||
                settings.coin === null ||
                (settings.workerId !== null && settings.coin === null)
            );
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
                case 'pool':
                default:
                    api.getPoolStats(apiRequest).subscribe(
                        ({ stats }) => {
                            ts = getTs();
                            storeAndSend({
                                coin: params.coin,
                                stats: stats[0],
                                status: true,
                            });
                        },
                        () => {
                            storeAndSend({
                                coin: params.coin,
                                stats: DefaultParams.NULLSTATLIVEITEM,
                                status: false,
                            });
                        },
                    );
                    return;
            }
            function storeAndSend(info: ISendLiveStat): void {
                storage.live.data = info.stats;
                storage.live.isLoading = false;
                storage.live.cacheTs = ts;
                sendResult.next({ status: info.status, coin: info.coin });
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
                    return;
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
                //histData = compareHistory(histData);
                calcChartsData(histData);

                coinObj.history.data = histData.stats;
                coinObj.history.isLoading = false;
                coinObj.history.cacheTs = historyResponce.currentTime;
                sendResult.next({ status: true, coin: params.coin });
            }
            function processErr() {
                coinObj.history.isLoading = false;
                sendResult.next({
                    status: false,
                    coin: params.coin,
                });
            }
            /*
            function compareHistory(data: IHistoryResp): IHistoryResp {
                if (coinObj.history.data.length > 2) {
                    let newStat: IHistoryItem2[] = [],
                        j = 0;
                    for (let i = 0; i < coinObj.history.data.length; i++) {
                        const el = coinObj.history.data[i];
                        if (j === 0 && el.time < data.stats[j].time) {
                            newStat.push(el);
                        } else if (j === 0 && el.time === data.stats[j].time) {
                            newStat.push(data.stats[j]);
                            j++;
                        } else if (j !== 0 && j < data.stats.length) {
                            newStat.push(data.stats[j]);
                            j++;
                        } else if (j !== 0 && j === data.stats.length) {
                            i = coinObj.history.data.length;
                        } else if (
                            j === 0 &&
                            el.time === data.stats[j].time - apiReq.groupByInterval
                        ) {
                            newStat.unshift(el);
                        } else {
                            throw new Error('Something is wrong');
                        }
                    }
                    for (j; j < data.stats.length; j++) {
                        newStat.push(data.stats[j]);
                    }
                }
                return data;
            }*/
            function fixHistory(data: IHistoryResp): IHistoryResp {
                const grInterval = apiReq.groupByInterval;
                let time = data.currentTime,
                    timeFrom = apiReq.timeFrom;

                //let expectedItems = Math.round((time - timeFrom) / grInterval);
                /*                let expectedItems =
                    parseInt(
                        ((time - timeFrom) / grInterval)
                            .toString()
                            .split(".")[0],
                    ) + 1;
*/
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

                /*
                while (data.stats.length < expectedItems) {
                    if (data.stats[0].time > timeFrom) {
                        nullStat.time = data.stats[0].time - grInterval;
                        data.stats.unshift(nullStat);
                    }
                    const l = data.stats.length - 1;
                    if (data.stats[l].time < time) {
                        nullStat.time = data.stats[l].time + grInterval;
                        data.stats.push(nullStat);
                    }
                    if (count > maxIterations)
                        throw new Error("Something is wrong");
                    else count++;
                }*/
                /*const l = data.stats.length - 1;
                data.stats[l].time = mainCoinObj.live.data.lastShareTime;
                if (mainCoinObj.info.name !== params.coin)
                    data.stats[l].time = time;
                data.stats[l].power = coinObj.live.data.power;
                //debugger;*/

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
                    this.apiGetBlocks.next({ status: true, coin: params.coin });
                },
                () => {
                    this.storageService.coinsObj[params.coin].blocks.data = [];
                    this.storageService.coinsObj[params.coin].blocks.isLoading = false;
                    this.storageService.coinsObj[params.coin].blocks.cacheTs = getTs();
                    this.apiGetBlocks.next({ status: true, coin: params.coin });
                },
            );
        } else {
            const ts = this.storageService.coinsObj[params.coin].history.cacheTs;
            const currZoom = this.storageService.currZoom;
            const maxTimeHistoryCashe = DefaultParams.HISTORYSTATCACHE;
            const maxTimeHistoryCasheZoom = DefaultParams.ZOOMPARAMS[currZoom].refreshTimer - 1;
            const maxTsDelta = Math.min(maxTimeHistoryCashe, maxTimeHistoryCasheZoom);
            this.storageService.coinsObj[params.coin].blocks.isLoading = false;
            if (ts !== 0 && ts + maxTsDelta < getTs()) {
                this.apiGetBlocks.next({ status: true, coin: params.coin });
            } else {
                let req = {} as IFetchParams;
                req.coin = params.coin;
                req.type = params.type;
                req.forceUpdate = true;
                if (params.user) req.user = params.user;
                if (params.hashFrom) req.hashFrom = params.hashFrom;
                if (params.heightFrom) req.heightFrom = params.heightFrom;
                this.blocks(req);
            }
        }
        function getTs() {
            return parseInt(((new Date().valueOf() / 1000) as any).toFixed(0));
        }
    }

    ///////////////////////////////////TODO////////////////////////
    ///////////////////////////////////TODO////////////////////////
    ///////////////////////////////////TODO////////////////////////
    ///////////////////////////////////TODO////////////////////////
    ///////////////////////////////////TODO////////////////////////
    ///////////////////////////////////TODO////////////////////////
    ///////////////////////////////////TODO////////////////////////

    fetchHistory(settings: IFetchHistory) {
        if (!isValidHistoryParams(settings)) return;

        const storage = this.storageService;
        //const defaultRequestParams = getDefaultStatsParams();
        const api = this.backendQueryApiService;
        const sendDat = this.getHistoryData;

        let lData = {
            responseData: {} as IPoolHistoryInfo,
            cached: false,
            //cache1dData: {},
            cachedTimeFrom: 0,
            cachedLastTime: 0,
            //thisCoin1DataLoaded: false,
            currentTime: 0,
        };
        //lData.cachedData = storage.chartData;
        //lData.thisCoinDataLoaded = storage.isChartsLoaded[settings.coin];
        //storage.chartsDataLoaded[settings.coin] = true;
        //const rrr = storage.chartsDataLoaded[settings.coin];

        //debugger;

        const zoom = storage.whatZoom;
        const gI = storage.whatZoomParams[zoom].groupByInterval;
        const sW = storage.whatZoomParams[zoom].statsWindow;
        const tF = getTime() - sW * gI;

        let apiRequest = {
            coin: settings.coin,
            timeFrom: tF,
            groupByInterval: gI,
        };
        settings.timeFrom = apiRequest.timeFrom;

        switch (settings.type) {
            case 'worker':
                getWorkerStatsHistory();
                break;
            case 'user':
                getUserStatsHistory();
                break;
            case 'userHistory':
                getUserDaylyHistory();
                break;
            case 'coin':
                ifCached();
                getPoolStatsHistory();
                break;
            default:
                return;
        }

        function getPoolStatsHistory() {
            api.getPoolStatsHistory(apiRequest).subscribe(
                (data: { stats; powerMultLog10; currentTime }) => {
                    /*if (data.stats.length > 3) {
                        const lastI = data.stats.length - 1;
                        const tmp1 = data.stats[lastI].shareWork;
                        const tmp2 = data.stats[lastI - 1].shareWork;
                        if (tmp1 === tmp2) data.stats.pop();
                    }*/

                    settings.powerMultLog10 = data.powerMultLog10;
                    lData.currentTime = data.currentTime;
                    const responseData = processHistoryData({
                        oldData: storage.chartData[apiRequest.coin].actualData,
                        newData: data.stats,
                    });
                    sendStatsHistory(responseData);
                },
            );
        }

        function getWorkerStatsHistory() {}
        function getUserStatsHistory() {}
        function getUserDaylyHistory() {}

        function ifCached() {
            if (
                (storage.isChartsLoaded[settings.coin] &&
                    storage.chartData[settings.coin].type === settings.type) ||
                storage.isZoomLoading[settings.coin]
            ) {
                //storage.chartData[settings.coin].actualData.pop();
                lData.cached = apiRequest.timeFrom <= storage.chartData[settings.coin].lastTime;
                if (lData.cached) {
                    const baseCoin = storage.whatBase.name;
                    lData.cachedTimeFrom = storage.chartData[baseCoin].timeFrom;
                    //lData.cachedLastTime =
                    //storage.chartData[baseCoin].lastTime -
                    //5 * apiRequest.groupByInterval;
                    settings.timeFrom = lData.cachedTimeFrom;
                    apiRequest.timeFrom = lData.cachedTimeFrom;
                }
            } else lData.cached = false;
        }

        function sendStatsHistory(history) {
            const data = { msg: history, settings };
            sendDat.next(data);
        }

        function processHistoryData(data: IHistProcess) {
            let updatedData: IPoolStatsHistoryItem[] = [];
            let oldShifted = 0,
                newPushed = 0,
                lastReplased = false;

            if (lData.cached && data.newData.length !== 0) {
                const oldData: IPoolStatsHistoryItem[] = data.oldData;
                const newData: IPoolStatsHistoryItem[] = data.newData;
                const maxDataLength = 500;

                while (oldData.length > 0 && oldData.length + newData.length > maxDataLength) {
                    oldData.shift();
                    oldShifted++;
                }

                let oldPushed = 0,
                    haveMore = false;

                oldData.forEach(item => {
                    if (item.time < newData[0].time) {
                        updatedData.push(item);
                        oldPushed++;
                    }
                });
                haveMore = oldData.length > oldPushed;

                let newProcessed = 0;
                newData.forEach(item => {
                    newProcessed++;

                    if (haveMore) {
                        if (oldData[oldPushed].time == item.time) {
                            updatedData.push(oldData[oldPushed]);
                            oldPushed++;
                            haveMore = oldData.length > oldPushed;
                        }
                    } else if (newProcessed < newData.length) {
                        item.power = item.power / Math.pow(10, 15 - settings.powerMultLog10);
                        updatedData.push(item);
                    } else if (newProcessed === newData.length) {
                        if (item.time > lData.currentTime) {
                            /*const interval =
                                updatedData[1].time - updatedData[0].time;
                            const delta =
                                interval - (item.time - lData.currentTime);
                            const newPower = (
                                (item.power * interval) /
                                delta
                            ).toFixed();
                            item.time = lData.currentTime;
                            item.power =
                                parseInt(newPower) /
                                Math.pow(10, 15 - settings.powerMultLog10);
                                */
                            item.time = lData.currentTime;
                            item.power =
                                settings.liveStat.power /
                                Math.pow(10, 15 - settings.powerMultLog10);
                        } else {
                            item.power = item.power / Math.pow(10, 15 - settings.powerMultLog10);
                        }
                        newPushed++;
                        updatedData.push(item);
                    }
                });
            } else {
                const fixStatsHistoryInfo = {
                    stats: data.newData,
                    tFrom: apiRequest.timeFrom,
                    gInterval: apiRequest.groupByInterval,
                    cTime: lData.currentTime,
                    lPower: settings.liveStat.power,
                    pMLog10: settings.powerMultLog10,
                    workerId: settings.workerId,
                };
                updatedData = fixStatsHistory(fixStatsHistoryInfo);
            }
            storeChartsData(updatedData, oldShifted, newPushed);
            return updatedData;
        }

        function storeChartsData(stats: IPoolStatsHistoryItem[], oldShifted, newPushed) {
            let prevData = [] as IPoolStatsHistoryItem[];
            if (storage.chartData[settings.coin].prevData.length !== 0)
                prevData = storage.chartData[settings.coin].actualData;

            storage.chartData[settings.coin] = {
                title: settings.coin,
                actualData: stats,
                prevData,
                type: settings.type,
                firstTime: stats[0].time,
                lastTime: stats[stats.length - 1].time,
                workerId: settings.workerId,
                timeFrom: settings.timeFrom,
                oldShifted,
                newPushed,
            };
            storage.isChartsLoaded[settings.coin] = true;
        }

        function fixStatsHistory(data: IFixStats) {
            /*let nStat = {
                name: "",
                time: data.tFrom,
                shareRate: 0,
                shareWork: 0,
                power: 0,
            };*/

            let history = data.stats || [];
            const { tFrom, gInterval, cTime, lPower, pMLog10 } = data;
            const maxDatadelta = 35 * 24 * 60 * 60;
            const maxDataItems = 1000;

            if (
                !storage.isZoomLoading &&
                (cTime - tFrom > maxDatadelta || history.length > maxDataItems)
            )
                throw new Error('Something is wrong');

            //if (history.length > 2) history.shift();
            if (history.length === 0)
                history.push({
                    name: '',
                    time: tFrom,
                    shareRate: 0,
                    shareWork: 0,
                    power: 0,
                });

            while (tFrom + gInterval < history[0].time) {
                const time = history[0].time - gInterval;
                history.unshift({
                    name: '',
                    time,
                    shareRate: 0,
                    shareWork: 0,
                    power: 0,
                });
            }

            //            while (cTime - gInterval > history[history.length - 1].time) {
            while (cTime >= history[history.length - 1].time) {
                const time = history[history.length - 1].time + gInterval;
                //nStat.time = history[history.length - 1].time + gInterval;
                history.push({
                    name: '',
                    time,
                    shareRate: 0,
                    shareWork: 0,
                    power: 0,
                });
            }

            if (history[history.length - 1].time < cTime) {
                history.push({
                    name: '',
                    time: cTime,
                    shareRate: 0,
                    shareWork: 0,
                    power: lPower,
                });
            }
            if (history[history.length - 1].time > cTime) {
                /*const interval = history[1].time - history[0].time;
                    const delta =
                        interval - (history[history.length - 1].time - cTime);
                    const newPower = (
                        (history[history.length - 1].power * interval) /
                        delta
                    ).toFixed();
                    
                    history[history.length - 1].time = cTime;
                    history[history.length - 1].power = parseInt(newPower);*/
                history[history.length - 1].time = cTime;
                history[history.length - 1].power = lPower;
            }
            //          }

            history.forEach(item => {
                item.power = item.power / Math.pow(10, 15 - pMLog10);
            });
            history.shift();
            return history;
        }

        function processWorkersData(data) {
            data.workers.forEach(item => {
                item.lastShareTime = data.currentTime - item.lastShareTime;
            });
            data.workers.sort((a, b) => {
                return b.lastShareTime - a.lastShareTime;
            });
            return data;
        }
        /*
        function getDefaultStatsParams(): any {
            let params = {
                timeFrom: 0,
                groupByInterval: 0,
                statsWindow: 0,
            };
            switch (settings.type) {
                case "worker":
                    break;
                case "user":
                    break;
                case "userHistory":
                    break;
                case "coin":
                default:
                    const zoom = storage.whatZoom;
                    const gI = storage.whatZoomParams[zoom].groupByInterval;
                    const sW = storage.whatZoomParams[zoom].statsWindow;
                    //params.groupByInterval = 1 * 60;
                    //params.statsWindow = 100;
                    //params.timeFrom =
                    //getTime() - params.statsWindow * params.groupByInterval;
                    params.timeFrom = getTime() - sW * gI;
            }
            //settings.timeFrom = params.timeFrom;
            return params;
        }
*/
        function getTime(): number {
            return ((new Date().setMinutes(0, 0, 0).valueOf() / 1000) as any).toFixed(0);
        }

        function isValidHistoryParams(settings: IFetchHistory): boolean {
            switch (settings.type) {
                case 'worker':
                    return isValidParams(settings.workerId);
                case 'user':
                case 'userHistory':
                case 'coin':
                    return isValidParams(settings.userId);
                default:
                    return false;
            }
            function isValidParams(type: string) {
                return !(
                    Object.keys(settings).length === 0 ||
                    settings.type === '' ||
                    settings.coin === '' ||
                    type === null
                );
            }
        }
        interface IHistProcess {
            oldData: IPoolStatsHistoryItem[];
            newData: IPoolStatsHistoryItem[];
        }
        interface IFixStats {
            stats: IWorkerStatsHistoryItem[];
            tFrom: number;
            gInterval: number;
            cTime: number;
            lPower: number;
            pMLog10: number;
        }
    }
    /*
    private u1pdateHistoryData(
        oldData: IPoolStatsHistoryItem[],
        newData: IPoolStatsHistoryItem[],
    ): IPoolStatsHistoryItem[] {
        let updatedData: IPoolStatsHistoryItem[] = [];

        oldData.pop();
        oldData.reverse();
        newData.reverse();
        let shift = 0;
        let retuarnData: number[] = [];
        for (let i = 0; i < newData.length; i++) {
            if (newData[i].time === oldData[shift].time) {
                updatedData.push(newData[i]);
                shift++;
            } else {
                updatedData.push(newData[i]);
            }
            if (shift > oldData.length) continue;
        }
        if (shift < oldData.length) {
            for (shift; shift < oldData.length; shift++) {
                updatedData.push(oldData[shift]);
            }
        }
        return updatedData.reverse();
    }
*/
    fetchBlocks(settings: IFetchBlocks) {
        if (
            Object.keys(settings).length === 0 ||
            (settings.count !== null && settings.user === null)
        )
            return;

        let req: IGetFoundBlocksParams = { coin: settings.coin },
            resp: IDataBlocks = { msg: [], settings };

        this.backendQueryApiService.getFoundBlocks(req).subscribe(
            ({ blocks }) => {
                if (settings.user !== '') {
                    blocks.filter(block => {
                        return block.foundBy === settings.user;
                    });
                }
                resp = { msg: blocks, settings };
                this.getBloksData.next(resp);
            },
            () => {
                this.getBloksData.next(resp);
            },
        );
    }
    /*
    getPoolCoinsList() {
        const poolCoins = this.storageService.poolCoins;
        //const poolCoins = [];
        if (!this.check(poolCoins)) {
            this.backendQueryApiService
                .getPoolCoins()
                .subscribe(({ coins }) => {
                    if (coins.length > 1) {
                        let theSameAlgo = true;
                        coins.forEach(coin => {
                            theSameAlgo = coins[0].algorithm === coin.algorithm;
                        });
                        if (theSameAlgo) {
                            coins.push({
                                name: coins[0].algorithm,
                                fullName: coins[0].algorithm,
                                algorithm: coins[0].algorithm,
                            });
                        }
                    }
                    this.coinsList = coins;
                    this.storageService.poolCoins = coins as IPoolCoinsItem[];
                    this.poolCoinsList.next(coins);
                });
        } else {
            this.poolCoinsList.next(poolCoins);
        }
    }
*/
    getCoinLiveStats(coin: TCoinName) {
        this.backendQueryApiService.getPoolStats({ coin }).subscribe(({ stats }) => {
            if (stats.length > 0) {
                this.coinStat = stats[0];
                this.poolCoinStats.next(stats[0]);
            }
        });
    }

    getPoolCoinStats() {
        const currentCoinInfo = this.storageService.currentCoinInfo;
        if (!this.check(currentCoinInfo)) return;
        this.backendQueryApiService
            .getPoolStats({ coin: currentCoinInfo.name })
            .subscribe(({ stats }) => {
                if (stats.length > 0) {
                    this.coinStat = stats[0];
                    this.poolCoinStats.next(stats[0]);
                }
            });
    }
    /*
    get2PoolCoinStats() {
        const currentCoinInfo = this.storageService.currentCoinInfo;
        if (this.check(currentCoinInfo)) return;

        const isAlgo = currentCoinInfo.name === currentCoinInfo.algorithm;
        const coin = isAlgo ? {} : { coin: currentCoinInfo.name };
        this.backendQueryApiService
            .getPoolStats(coin)
            .subscribe(({ stats }) => {
                if (stats.length > 0) {
                    this.coinStats = stats;
                    if (isAlgo) {
                        this.backendQueryApiService
                            .getPoolStats({ coin: currentCoinInfo.name })
                            .subscribe(({ stats }) => {
                                if (stats.length == 1) {
                                    this.coinStats.push(stats[0]);
                                    this.poolCoinStats.next(stats);
                                }
                            });
                    } else {
                        this.poolCoinStats.next(stats);
                    }
                }
            });
    }*/

    getUserCoinStats(coinName?: TCoinName) {
        const currentCoinInfo = this.storageService.currentCoinInfo;
        if (!this.check(currentCoinInfo) && !coinName) return;

        this.backendQueryApiService
            .getUserStats({ coin: coinName ? coinName : currentCoinInfo.name })
            .subscribe((stats: IGetUserStatsResponse) => {
                const msg = this.processWorkersData(stats);
                this.uStats = msg as IUserStats;
                this.subjUStats.next(msg);
            });
    }

    /*
    getPoolCoinStatsHistory() {
       
        const currentCoinInfo = this.storageService.currentCoinInfo;
        if (!this.check(currentCoinInfo)) return;

        const currentLiveStat = this.storageService.poolCoinsliveStat;
        if (!this.check(currentLiveStat))
         return;

        const groupByInterval = 60 * 60 - 1,
            statsWindow = 50;

        let timeFrom;
        if (
            this.storageService.chartsTimeFrom === null ||
            currentCoinInfo.name === currentCoinInfo.algorithm
        ) {
            timeFrom =
                ((new Date().valueOf() / 1000) as any).toFixed(0) -
                statsWindow * groupByInterval;
        } else timeFrom = this.storageService.chartsTimeFrom;

        this.backendQueryApiService
            .getPoolStatsHistory({
                coin: currentCoinInfo.name,
                timeFrom,
                groupByInterval,
            })
            .subscribe(({ stats, powerMultLog10, currentTime }) => {
                const data = { stats, powerMultLog10, currentTime };
                const fixMe = {
                    stats: data.stats as [],
                    timeFrom,
                    currentTime: data.currentTime,
                    groupByInterval: groupByInterval,
                    statsWindow,
                    liveStats: currentLiveStat as {},
                    powerMultLog10,
                } as IFixStatsData;
                const msg = this.processHistoryData(fixMe) as IPoolHistoryInfo;
                //msg.powerMultLog10 = powerMultLog10;
                if (currentCoinInfo.name === currentCoinInfo.algorithm) {
                    this.storageService.chartsTimeFrom =
                        msg.stats[0].time - groupByInterval;
                    this.storageService.chartsBaseData = {
                        title: currentCoinInfo.name,
                        data: msg.stats as [],
                    };
                }
                this.coinHistory = msg;
                this.poolCoinStatsHistory.next(msg);
            });
    }
*/
    getUserCoinStatsHistory() {
        /*coin: TCoinName, liveStats: IUserStatsItem*/
        const currentCoinInfo = this.storageService.currentCoinInfo;
        if (!this.check(currentCoinInfo)) return;

        const currentUserLiveStat = this.storageService.currentUserliveStat.total;
        if (!this.check(currentUserLiveStat)) return;

        const groupByInterval = 30 * 60 - 1,
            statsWindow = 70;

        let timeFrom;
        if (
            this.storageService.chartsTimeFrom === null ||
            currentCoinInfo.name === currentCoinInfo.algorithm
        ) {
            timeFrom =
                ((new Date().valueOf() / 1000) as any).toFixed(0) - statsWindow * groupByInterval;
        } else timeFrom = this.storageService.chartsTimeFrom;

        this.backendQueryApiService
            .getUserStatsHistory({
                coin: currentCoinInfo.name,
                timeFrom,
                groupByInterval,
            })
            .subscribe(({ stats, powerMultLog10, currentTime }) => {
                const data = { stats, powerMultLog10, currentTime };
                const fixMe = {
                    stats: data.stats as [],
                    timeFrom,
                    currentTime: data.currentTime,
                    groupByInterval: groupByInterval,
                    statsWindow,
                    liveStats: currentUserLiveStat as IUserStatsItem,
                    powerMultLog10,
                } as IFixStatsData;
                const msg = this.processHistoryData(fixMe) as IUserHistoryInfo;
                //msg.powerMultLog10 = powerMultLog10;
                if (currentCoinInfo.name === currentCoinInfo.algorithm) {
                    this.storageService.chartsTimeFrom = msg.stats[0].time - groupByInterval;
                    this.storageService.charts1BaseData = {
                        title: currentCoinInfo.name,
                        data: msg.stats as [],
                    };
                }
                this.uStatsHist = msg;
                this.subjUStatsHist.next(msg);
            });
    }

    getUserWorkerCoinStatsHistory() {
        /*        coin: TCoinName,
        workerId: string,
        liveStats: IWorkerStatsItem,
*/
        const currentCoinInfo = this.storageService.currentCoinInfoWorker;
        if (!this.check(currentCoinInfo)) return;
        const currentWorker = this.storageService.currentWorkerName;
        if (!this.check(currentWorker)) return;

        // ищем живую статистику по работнику, если в живых данных нет информации,
        // то подменить на нулевую статистику
        const currentWorkerLiveStat = this.storageService.currentUserliveStat.workers.find(item => {
            return item.name === currentWorker;
        }) || {
            lastShareTime: 0,
            name: this.storageService.currentWorkerName,
            power: 0,
            shareRate: 0,
            shareWork: 0,
        };

        if (Object.keys(currentWorkerLiveStat).length === 0) return;

        const groupByInterval = 15 * 60 - 1,
            statsWindow = 98;

        let timeFrom;
        if (
            this.storageService.chartsWorkerTimeFrom === null ||
            currentCoinInfo.name === currentCoinInfo.algorithm
        ) {
            timeFrom =
                ((new Date().valueOf() / 1000) as any).toFixed(0) - statsWindow * groupByInterval;
            //this.storageService.chartsTimeFrom = timeFrom;
        } else timeFrom = this.storageService.chartsWorkerTimeFrom;

        this.backendQueryApiService
            .getWorkerStatsHistory({
                coin: currentCoinInfo.name,
                workerId: currentWorker,
                timeFrom,
                groupByInterval,
            })
            .subscribe(({ stats, powerMultLog10, currentTime }) => {
                const data = { stats, powerMultLog10, currentTime };
                const fixMe = {
                    stats: data.stats as [],
                    timeFrom,
                    currentTime: data.currentTime,
                    groupByInterval: groupByInterval,
                    statsWindow,
                    liveStats: currentWorkerLiveStat as IWorkerStatsItem,
                    workerId: currentWorker,
                    powerMultLog10,
                } as IFixStatsData;
                const msg = this.processHistoryData(fixMe) as IWorkerHistoryInfo;
                //msg.powerMultLog10 = powerMultLog10;
                if (currentCoinInfo.name === currentCoinInfo.algorithm) {
                    this.storageService.chartsWorkerTimeFrom = msg.stats[0].time - groupByInterval;
                    this.storageService.charts1BaseData = {
                        title: currentCoinInfo.name,
                        data: msg.stats as [],
                    };
                }
                this.uStatsHist = msg;
                this.subjUWStatsHist.next(msg);
            });
    }

    getFoundBlocks(coin: TCoinName, user?: string | '') {
        this.backendQueryApiService.getFoundBlocks({ coin }).subscribe(
            ({ blocks }) => {
                if (user !== '') {
                    blocks.filter(block => {
                        return block.foundBy === user;
                    });
                }
                this.coinBlocks = blocks;
                this.poolCoinBlocks.next(blocks);
            },
            () => {
                this.coinBlocks = [];
                this.poolCoinBlocks.next([]);
            },
        );
    }
    /*
    getPoolCoinBlocks() {
        const currentCoinInfo = this.storageService.currentCoinInfo;
        if (!this.check(currentCoinInfo)) return;

        if (currentCoinInfo.name !== currentCoinInfo.algorithm) {
            this.backendQueryApiService
                .getFoundBlocks({ coin: currentCoinInfo.name })
                .subscribe(
                    ({ blocks }) => {
                        this.coinBlocks = blocks;
                        this.poolCoinBlocks.next(blocks);
                    },
                    () => {
                        this.coinBlocks = [];
                        this.poolCoinBlocks.next([]);
                    },
                );
        } else {
            this.coinBlocks = [];
            this.poolCoinBlocks.next([]);
        }
    } */

    getUserBalance(): void {
        this.backendQueryApiService.getUserBalance().subscribe(({ balances }) => {
            this.uBalances = balances;
            this.subjUBalance.next(balances);
        });
    }

    private check(data) {
        if (data === null || data === '') return false;
        if (typeof data === 'object') return Object.keys(data).length > 0;
        if (Array.isArray(data)) return data.length > 0;
        return true;
    }

    /*
    private getPoolStatsApi(coinName?: TCoinName) {
        const coin = coinName ? {} : { coin: coinName };
        this.backendQueryApiService
            .getPoolStats(coin)
            .subscribe(({ stats }) => {
                return stats;
            });
    }

    private fetchPoolCoinStats(
        coinName: Object,
        isAlgo?: boolean,
    ): IPoolStatsItem[] {
        let resp = [] as IPoolStatsItem[];
        this.backendQueryApiService
            .getPoolStats(coinName)
            .subscribe(({ stats }) => {
                if (stats.length > 0) {
                    resp = stats;
                    if (isAlgo) {
                        const coinsData = this.fetchPoolCoinStats({});
                        if (coinsData.length !== 0) resp.push(coinsData[0]);
                    }
                }
                return resp || ([] as IPoolStatsItem[]);
            },
            ()=>{
                return resp || ([] as IPoolStatsItem[]);
            });
        
    }
*/
    private processWorkersData(data) {
        data.workers.forEach(item => {
            item.lastShareTime = data.currentTime - item.lastShareTime;
        });
        data.workers.sort((a, b) => {
            return b.lastShareTime - a.lastShareTime;
        });
        return data;
    }

    private processHistoryData(data) {
        //data.stats = this.fixStatsHistory(data as  IFixStatsData); // add zero stats
        if (
            data.timeFrom === undefined ||
            data.groupByInterval === undefined ||
            data.stats === undefined
        )
            throw new Error('processHistoryData error');

        //debugger;

        var stats = data.stats;
        if (stats.length === 0) {
            stats = [
                {
                    name: '',
                    time: data.timeFrom,
                    shareRate: 0,
                    shareWork: 0,
                    power: 0,
                },
            ];
        }
        while (data.timeFrom + data.groupByInterval <= stats[0].time) {
            stats.unshift({
                name: '',
                time: stats[0].time - data.groupByInterval,
                shareRate: 0,
                shareWork: 0,
                power: 0,
            });
        }
        while (data.currentTime - data.groupByInterval >= stats[stats.length - 1].time) {
            stats.push({
                name: '',
                time: stats[stats.length - 1].time + data.groupByInterval,
                shareRate: 0,
                shareWork: 0,
                power: 0,
            });
        }
        if (stats[stats.length - 1].time < data.currentTime) {
            stats.push({
                name: '',
                time: data.currentTime,
                shareRate: 0,
                shareWork: 0,
                power: data.liveStats ? data.liveStats.power : 0,
            });
        } else {
            stats[stats.length - 1].time = data.currentTime;
            stats[stats.length - 1].power = data.liveStats ? data.liveStats?.power : 0;
        }

        if (stats.length > 2) stats.shift();

        const rate = Math.pow(10, 15 - data.powerMultLog10);
        stats.forEach(item => {
            item.power = item.power / rate;
        });
        //debugger;
        const message = {
            stats,
            powerMultLog10: data.powerMultLog10,
            workerId: data.workerId === '' ? null : data.workerId,
        };
        return message;
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

export interface ICoinsInfo {
    [coin: string]: {
        info: {
            data: IPoolCoinsItem;
            needFetch: boolean;
            isBase: boolean;
            isAlgo: boolean;
        };
        live: {
            data: IPoolStatsItem[] | IUserStatsItem | IWorkerStatsItem;
            isLoading: boolean;
        };
        hist: {
            data: IPoolStatsHistoryItem[];
            timeFrom: number;
            powerMultLog10: number;
            isLoading: boolean;
        };
        blocks: {
            data: IFoundBlock[];
            isLoading: boolean;
        };
    };
}

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
