import {
    IZoomList,
    IZoom,
    IExplorerLink,
    IHistoryItem2,
    IZoomSettings,
    ILiveStatWorker,
    IFetchResponce,
    ILocalTimeDelta,
    ILiveStatUser,
    ILiveStatCommon,
} from 'interfaces/common';
//import { Injectable } from "@angular/core";

//@Injectable({
//providedIn: "root",
//})
export class DefaultParams {
    static readonly ADMINNAME: string = 'admin';
    static readonly GAZERNAME: string = 'observer';
    static readonly BASECOINSWITCHTIMER: number = 900;
    static readonly BLOCKSFETCHTIMER: number = 120;
    static readonly DATAUPDATETIMER: number = 29;
    static readonly LIVESTATCACHE: number = 15;
    static readonly HISTORYSTATCACHE: number = 50;
    static readonly MAXHISTORYITEMS: number = 500;
    static readonly MULTIPLYHISTORYDATAFORCHART: number = 3;
    static readonly FETCHRESPONCE: IFetchResponce = { status: false, coin: '', type: '' };
    static readonly DEFAULTTYPE = 'pool';
    static readonly DNSNAME = 'zulupool.com';
    static readonly SUPPORTMAIL = 'XXXXXXXXXXXXXXXXXXXXXXX';
    static readonly PPDAALGO = 'sha256d';
    static readonly STRATUM = 'sha256.';
    static readonly REQTYPE = {
        POOL: 'pool',
        USER: 'user',
        WORKER: 'worker',
    };
    static readonly LOCALTIMEDELTA: ILocalTimeDelta = {
        delta: 0,
        isUpdated: false,
    };
    static readonly NULLSTATHISTORYITEM: IHistoryItem2 = {
        name: '',
        time: 0,
        shareRate: 0,
        shareWork: 0,
        power: 0,
    };
    static readonly NULLSTATLIVEITEM: ILiveStatWorker = {
        lastShareTime: 0,
        name: '',
        power: 0,
        shareRate: 0,
        shareWork: 0,
    };
    static readonly NULLSTATUSERLIVEITEM: ILiveStatCommon = {
        lastShareTime: 0,
        power: 0,
        shareRate: 0,
        shareWork: 0,
        miners: [],
        workers: 0,
    };
    static readonly BLOCKSLINKS: IExplorerLink = {
        BTC: 'https://btc.com/',
        BCH: 'https://bch.btc.com/',
        BCHN: 'https://bch.btc.com/',
        BCHA: 'https://bch.btc.com/',
        BSV: 'https://whatsonchain.com/block/',
        DGB: 'https://chainz.cryptoid.info/dgb/block.dws?',
        FCH: 'http://fch.world/block/',
        HTR: 'https://explorer.hathor.network/transaction/',
    };
    static readonly TXLINKS: IExplorerLink = {
        BTC: 'https://btc.com/',
        BCH: 'https://bch.btc.com/',
        BCHN: 'https://bch.btc.com/',
        BCHA: 'https://bch.btc.com/',
        BSV: 'https://whatsonchain.com/tx/',
        DGB: 'https://chainz.cryptoid.info/dgb/tx.dws?',
        FCH: 'http://fch.world/tx/',
        HTR: 'https://explorer.hathor.network/transaction/',
    };
    static readonly ADDRLINKS: IExplorerLink = {
        BTC: 'https://btc.com/',
        BCH: 'https://bch.btc.com/',
        BCHN: 'https://bch.btc.com/',
        BCHA: 'https://bch.btc.com/',
        BSV: 'https://whatsonchain.com/address/',
        DGB: 'https://chainz.cryptoid.info/dgb/address.dws?',
        FCH: 'http://fch.world/address/',
        HTR: 'https://explorer.hathor.network/address/',
    };

    //static readonly zoom: string = "15M";
    //static readonly zoomList: string[] = ["1M","5M","30M","H1","H4","D","W",];
    static readonly ZOOM: IZoom = {
        pool: '1M',
        user: '5M',
        worker: '5M',
        history: 'D',
    };
    static readonly ZOOMSLIST: IZoomList = {
        pool: ['1M', '15M', 'H1', 'H4', 'D'],
        user: ['5M', '15M', 'H1', 'H4', 'D'],
        worker: ['5M', '30M', 'H1', 'H4', 'D'],
        history: ['D', 'W', 'M'],
    };
    static readonly ZOOMPARAMS: IZoomSettings = {
        '1M': {
            groupByInterval: 1 * 60,
            statsWindow: 50,
            maxStatsWindow: 60,
            refreshTimer: 20,
            labelText: 'HH:mm',
            lastLabelText: 'HH:mm:ss',
        },
        '5M': {
            groupByInterval: 5 * 60,
            statsWindow: 80,
            maxStatsWindow: 90,
            refreshTimer: 60,
            labelText: 'HH:mm',
            lastLabelText: 'HH:mm:ss',
        },
        '10M': {
            groupByInterval: 10 * 60,
            statsWindow: 80,
            maxStatsWindow: 90,
            refreshTimer: 60,
            labelText: 'HH:mm',
            lastLabelText: 'HH:mm:ss',
        },
        '15M': {
            groupByInterval: 15 * 60,
            statsWindow: 80,
            maxStatsWindow: 90,
            refreshTimer: 60,
            labelText: 'HH:mm',
            lastLabelText: 'HH:mm:ss',
        },
        '30M': {
            groupByInterval: 30 * 60,
            statsWindow: 80,
            maxStatsWindow: 90,
            refreshTimer: 60,
            labelText: 'HH:mm',
            lastLabelText: 'HH:mm:ss',
        },
        H1: {
            groupByInterval: 60 * 60,
            statsWindow: 80,
            maxStatsWindow: 90,
            refreshTimer: 60,
            labelText: 'dd HH:mm',
            lastLabelText: 'HH:mm:ss',
        },
        H4: {
            groupByInterval: 4 * 60 * 60,
            statsWindow: 80,
            maxStatsWindow: 90,
            refreshTimer: 60,
            labelText: 'dd HH:mm',
            lastLabelText: 'HH:mm:ss',
        },
        D: {
            groupByInterval: 24 * 60 * 60,
            statsWindow: 80,
            maxStatsWindow: 90,
            refreshTimer: 60,
            labelText: 'dd HH:mm',
            lastLabelText: 'HH:mm:ss',
        },
        W: {
            groupByInterval: 7 * 24 * 60 * 60,
            statsWindow: 80,
            maxStatsWindow: 90,
            refreshTimer: 60,
            labelText: 'dd HH:mm',
            lastLabelText: 'HH:mm:ss',
        },
    };
}
