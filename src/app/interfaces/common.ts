import { EPowerUnit } from "enums/power-unit";

export interface ICoinItem {
    name: string;
    fullName: string;
    algorithm: string;
    powerMultLog10?: number;
}

export interface IZoom {
    [type: string]: string;
}
export interface IZoomList {
    [type: string]: string[];
}
export interface IExplorerLink {
    [coin: string]: string;
}

export interface IZoomSettings {
    [zoom: string]: {
        groupByInterval: number;
        statsWindow: number;
        maxStatsWindow: number;
        refreshTimer: number;
    };
}

export interface ICoins {
    data?: ICoinItem[];
    isLoading: boolean;
}
export interface IBlockItem {
    height: number;
    hash: string;
    time: number;
    confirmations: number;
    generatedCoins: string;
    foundBy: string;
}
/*
export interface ICharts {
    data?: IChartParams;
    isLoading: boolean;
}*/
export interface IBlocks {
    data: IBlockItem[];
    isLoading: boolean;
    cacheTs: number;
}
export interface IHistoryItem2 {
    name: string;
    time: number;
    shareRate: number;
    shareWork: number;
    power: number;
}
export interface IHistoryStat {
    data: IHistoryItem2[];
    isLoading: boolean;
    cacheTs?: number;
    timeFrom: number;
    timeTo?: number;
    grByInterval: number;
    chart: IChartData;
}
export interface ILiveStat {
    data: ILiveStatPool | ILiveStatUser | ILiveStatWorker;
    isLoading: boolean;
    cacheTs: number;
}

export interface IZoomParams {
    [zoom: string]: {
        groupByInterval: number;
        statsWindow: number;
        refreshTimer: number;
    };
}

export interface IFetchResponce {
    status: boolean;
    coin: string;
}

export interface ICoinParams {
    info: ICoinItem;
    isMain: boolean;
    isAlgo: boolean;
    isSpliName: boolean;
    isNeedRefresh: boolean;
    blocks?: IBlocks;
    live?: ILiveStat;
    history?: IHistoryStat;
}

export interface ICoinsData {
    [coin: string]: ICoinParams;
}

export interface IHistoryResp {
    stats: IHistoryItem2[];
    powerMultLog10: number;
    currentTime: number;
}
export interface IChartData {
    data: number[];
    label: number[];
    workerId?: string;
    datasetI?: number;
}

export interface IFetchResponce {
    status: boolean;
    coin: string;
}
export interface IFetchParams {
    coin: string;
    type: string;
    workerId?: string;
    forceUpdate?: boolean | true;
    user?: string;
    heightFrom?: number;
    hashFrom?: string;
    count?: number;
}

export interface ILocalTimeDelta {
    delta: number;
    isUpdated: boolean;
}
export interface ISendLiveStat {
    coin: string;
    stats: ILiveStatPool | ILiveStatUser | ILiveStatWorker;
    status: boolean;
}
export interface ISendHistoryStat {
    coin: string;
    stats: IHistoryItem2[];
    status: boolean;
}

export interface ILiveStatCommon {
    shareRate: number;
    shareWork: number;
    power: number;
    lastShareTime: number;
    powerMultLog10?: number | 1;
    powerUnit?: EPowerUnit;
}
export interface ILiveStatUser extends ILiveStatCommon {
    clients: number;
    workers: number;
}
export interface ILiveStatWorker extends ILiveStatCommon {
    name: string;
}
export interface ILiveStatPool extends ILiveStatUser {
    coin: string;
}
