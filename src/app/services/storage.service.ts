import { Injectable } from "@angular/core";
import {
    IPoolCoinsItem,
    IPoolStatsItem,
    IWorkerStatsHistoryItem,
    IWorkerStatsItem,
    IUserStatsItem,
    IUserStats,
    IPoolCoinsData,
    IPoolStatsData,
    IFoundBlock,
    IPoolStatsHistoryItem,
    ICinfo,
} from "interfaces/backend-query";

@Injectable({ providedIn: "root" })
export class StorageService {
    constructor() {}

    private allCoins = [] as IPoolCoinsItem[];
    private currentCoin = {};
    private baseCoin = {} as IPoolCoinsItem;
    private chartsLoaded = {};
    private zoomLoading = {};
    private chartsData = {};
    private currentZoom = "15M";
    private zoomList = ["1M", "5M", "15M", "H1", "H4", "D1"];
    private zoomParams = {
        "1M": {
            groupByInterval: 1 * 60,
            statsWindow: 100,
        },
        "5M": {
            groupByInterval: 5 * 60,
            statsWindow: 100,
        },
        "15M": {
            groupByInterval: 15 * 60,
            statsWindow: 100,
        },
        H1: {
            groupByInterval: 60 * 60,
            statsWindow: 100,
        },
        H4: {
            groupByInterval: 4 * 60 * 60,
            statsWindow: 100,
        },
        D1: {
            groupByInterval: 24 * 60 * 60,
            statsWindow: 100,
        },
    };

    get chartData(): {
        [coin: string]: {
            title: string;
            actualData: IWorkerStatsHistoryItem[];
            prevData: IWorkerStatsHistoryItem[];
            firstTime?: number;
            lastTime?: number;
            timeFrom?: number;
            type?: string;
            workerId?: string;
            oldShifted?: number;
            newPushed?: number;
        };
    } {
        return this.chartsData;
    }
    set chartData(data: {
        [coin: string]: {
            title: string;
            actualData: IWorkerStatsHistoryItem[];
            prevData: IWorkerStatsHistoryItem[];
            firstTime?: number;
            lastTime?: number;
            timeFrom?: number;
            type?: string;
            workerId?: string;
            oldShifted?: number;
            newPushed?: number;
        };
    }) {
        this.chartsData = data;
    }

    get isZoomLoading(): { [coin: string]: boolean } {
        return this.zoomLoading;
    }
    set isZoomLoading(data: { [coin: string]: boolean }) {
        this.zoomLoading = data;
    }
    get isChartsLoaded(): { [coin: string]: boolean } {
        return this.chartsLoaded;
    }
    set isChartsLoaded(data: { [coin: string]: boolean }) {
        this.chartsLoaded = data;
    }

    get whatZoomParams(): {} {
        return this.zoomParams;
    }
    set whatZoomParams(params: {}) {
        if (params) this.zoomParams = params as any;
        else this.zoomParams = {} as any;
    }
    get whatZoom(): string {
        return this.currentZoom;
    }
    set whatZoom(zoom: string) {
        if (zoom) this.currentZoom = zoom;
        else this.currentCoin = {};
    }
    get whatZooms(): string[] {
        return this.zoomList;
    }
    set whatZooms(zoom: string[]) {
        if (zoom) this.zoomList = zoom;
        else this.currentCoin = {};
    }
    get whatCoin(): {} {
        return this.currentCoin;
    }
    set whatCoin(data: {}) {
        if (data) this.currentCoin = data;
        else this.currentCoin = {};
    }
    get whatBase(): IPoolCoinsItem {
        return this.baseCoin;
    }

    set whatBase(data: IPoolCoinsItem) {
        if (data) this.baseCoin = data;
        else this.baseCoin = {} as IPoolCoinsItem;
    }
    get whatCoins(): IPoolCoinsItem[] {
        return this.allCoins;
    }

    set whatCoins(data: IPoolCoinsItem[]) {
        if (data) this.allCoins = data;
        else this.allCoins = [] as IPoolCoinsItem[];
    }

    get sessionId(): string | null {
        return window.localStorage.getItem("sessionId") || null;
    }

    set sessionId(sessionId: string | null) {
        if (sessionId) window.localStorage.setItem("sessionId", sessionId);
        else window.localStorage.removeItem("sessionId");
    }

    get targetLogin(): string | null {
        return window.localStorage.getItem("targetLogin") || null;
    }

    set targetLogin(targetLogin: string | null) {
        if (targetLogin)
            window.localStorage.setItem("targetLogin", targetLogin);
        else window.localStorage.removeItem("targetLogin");
    } /*
    get poolCoins2(): { [coin: string]: IPoolCoinsData } {
        return JSON.parse(window.localStorage.getItem("coins")) || false;
    }
    set poolCoins2(data: { [coin: string]: IPoolCoinsData }) {
        if (data) window.localStorage.setItem("coins", JSON.stringify(data));
        else window.localStorage.removeItem("coins");
    }
*/

    get poolCoins(): IPoolCoinsItem[] | null {
        return JSON.parse(window.localStorage.getItem("poolCoins")) || null;
    }
    set poolCoins(poolCoins: IPoolCoinsItem[] | null) {
        if (poolCoins)
            window.localStorage.setItem("poolCoins", JSON.stringify(poolCoins));
        else window.localStorage.removeItem("poolCoins");
    }
    /*
    get coinsCacheTime(): number | null {
        return parseInt(window.localStorage.getItem("coinsCacheTime")) || null;
    }
    set coinsCacheTime(time: number | null) {
        if (time)
            window.localStorage.setItem("coinsCacheTime", time.toString());
        else window.localStorage.removeItem("coinsCacheTime");
    }
*/
    get poolCoinsliveStat(): IPoolStatsItem | null {
        return (
            JSON.parse(window.localStorage.getItem("poolCoinsliveStat")) || null
        );
    }
    set poolCoinsliveStat(poolCoinsliveStat: IPoolStatsItem | null) {
        if (poolCoinsliveStat)
            window.localStorage.setItem(
                "poolCoinsliveStat",
                JSON.stringify(poolCoinsliveStat),
            );
        else window.localStorage.removeItem("poolCoinsliveStat");
    }
    get poolCoinsliveStat2(): { [coin: string]: IPoolStatsData } | null {
        return JSON.parse(window.localStorage.getItem("cLiveStat")) || null;
    }
    set poolCoinsliveStat2(data: { [coin: string]: IPoolStatsData }) {
        if (data)
            window.localStorage.setItem("cLiveStat", JSON.stringify(data));
        else window.localStorage.removeItem("cLiveStat");
    }

    get currentCoinInfo(): IPoolCoinsItem {
        return (
            JSON.parse(window.localStorage.getItem("currentCoinInfo")) ||
            ({} as IPoolCoinsItem)
        );
    }
    set currentCoinInfo(currentCoinInfo: IPoolCoinsItem | null) {
        if (currentCoinInfo)
            window.localStorage.setItem(
                "currentCoinInfo",
                JSON.stringify(currentCoinInfo),
            );
        else window.localStorage.removeItem("currentCoinInfo");
    }

    get currentCoinInfoWorker(): IPoolCoinsItem {
        return (
            JSON.parse(window.localStorage.getItem("currentCoinInfoWorker")) ||
            ({} as IPoolCoinsItem)
        );
    }
    set currentCoinInfoWorker(currentCoinInfoWorker: IPoolCoinsItem | null) {
        if (currentCoinInfoWorker)
            window.localStorage.setItem(
                "currentCoinInfoWorker",
                JSON.stringify(currentCoinInfoWorker),
            );
        else window.localStorage.removeItem("currentCoinInfoWorker");
    }

    get currentUser(): string | null {
        return window.localStorage.getItem("currentUser") || null;
    }
    set currentUser(currentUser: string | null) {
        if (currentUser)
            window.localStorage.setItem("currentUser", currentUser);
        else window.localStorage.removeItem("currentUser");
    }
    get chartsTimeFrom(): number | null {
        return parseInt(window.localStorage.getItem("chartsTimeFrom")) || null;
    }
    set chartsTimeFrom(chartsTimeFrom: number | null) {
        if (chartsTimeFrom)
            window.localStorage.setItem(
                "chartsTimeFrom",
                chartsTimeFrom.toString(),
            );
        else window.localStorage.removeItem("chartsTimeFrom");
    }

    get chartsWorkerTimeFrom(): number | null {
        return (
            parseInt(window.localStorage.getItem("chartsWorkerTimeFrom")) ||
            null
        );
    }
    set chartsWorkerTimeFrom(chartsWorkerTimeFrom: number | null) {
        if (chartsWorkerTimeFrom)
            window.localStorage.setItem(
                "chartsWorkerTimeFrom",
                chartsWorkerTimeFrom.toString(),
            );
        else window.localStorage.removeItem("chartsWorkerTimeFrom");
    }
    /*
    get chartsDataLoaded(): { [coin: string]: boolean | false } {
        return JSON.parse(window.localStorage.getItem("chDLoaded")) || false;
    }
    set chartsDataLoaded(data: { [coin: string]: boolean }) {
        if (data)
            window.localStorage.setItem("chDLoaded", JSON.stringify(data));
        else window.localStorage.removeItem("chDLoaded");
    }
    */

    get charts1BaseData(): {
        title: string;
        data: IWorkerStatsHistoryItem[];
        firstTime?: number;
        lastTime?: number;
        timeFrom?: number;
        type?: string;
        workerId?: string;
    } | null {
        return JSON.parse(window.localStorage.getItem("chBData")) || null;
    }
    set charts1BaseData(
        chartsBaseData: {
            title: string;
            data: IWorkerStatsHistoryItem[];
            firstTime?: number;
            lastTime?: number;
            timeFrom?: number;
            type?: string;
            workerId?: string;
        } | null,
    ) {
        if (chartsBaseData)
            window.localStorage.setItem(
                "chBData",
                JSON.stringify(chartsBaseData),
            );
        else window.localStorage.removeItem("chBData");
    }

    get chartsWorkerBaseData(): {
        title: string;
        data: [];
    } | null {
        return (
            JSON.parse(window.localStorage.getItem("chartsWorkerBaseData")) ||
            {}
        );
    }
    set chartsWorkerBaseData(
        chartsWorkerBaseData: {
            title: string;
            data: [];
        } | null,
    ) {
        if (chartsWorkerBaseData)
            window.localStorage.setItem(
                "chartsWorkerBaseData",
                JSON.stringify(chartsWorkerBaseData),
            );
        else window.localStorage.removeItem("chartsWorkerBaseData");
    }

    get currentUserliveStat(): IUserStats | null {
        return (
            JSON.parse(window.localStorage.getItem("currentUserliveStat")) ||
            null
        );
    }
    set currentUserliveStat(currentUserliveStat: IUserStats | null) {
        if (currentUserliveStat)
            window.localStorage.setItem(
                "currentUserliveStat",
                JSON.stringify(currentUserliveStat),
            );
        else window.localStorage.removeItem("currentUserliveStat");
    }

    get currentWorkerName(): string | null {
        return window.localStorage.getItem("currentWorkerName") || null;
    }
    set currentWorkerName(currentWorkerName: string | null) {
        if (currentWorkerName)
            window.localStorage.setItem("currentWorkerName", currentWorkerName);
        else window.localStorage.removeItem("currentWorkerName");
    }
    get needWorkerInint(): boolean | null {
        return window.localStorage.getItem("needWorkerInint") == "true" || null;
    }
    set needWorkerInint(needWorkerInint: boolean | null) {
        if (needWorkerInint)
            window.localStorage.setItem(
                "needWorkerInint",
                needWorkerInint.toString(),
            );
        else window.localStorage.removeItem("needWorkerInint");
    }

    /*    get currentWorkerliveStat(): IWorkerStatsItem[] | null {
        return (
            JSON.parse(window.localStorage.getItem("currentWorkerliveStat")) ||
            null
        );
    }
    set currentWorkerliveStat(
        currentWorkerliveStat: IWorkerStatsItem[] | null,
    ) {
        if (currentWorkerliveStat)
            window.localStorage.setItem(
                "currentWorkerliveStat",
                JSON.stringify(currentWorkerliveStat),
            );
        else window.localStorage.removeItem("currentWorkerliveStat");
    }
*/
    get userSettings(): {} | null {
        return JSON.parse(window.localStorage.getItem("userSettings")) || null;
    }
    set userSettings(userSettings: {} | null) {
        if (userSettings)
            window.localStorage.setItem(
                "userSettings",
                JSON.stringify(userSettings),
            );
        else window.localStorage.removeItem("userSettings");
    }

    get userCredentials(): {} | null {
        return window.localStorage.getItem("userCredentials") || null;
    }
    set userCredentials(userCredentials: {} | null) {
        if (userCredentials)
            window.localStorage.setItem(
                "userCredentials",
                JSON.stringify(userCredentials),
            );
        else window.localStorage.removeItem("userCredentials");
    }
}
