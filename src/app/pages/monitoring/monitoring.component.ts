import { Component, OnInit, OnDestroy } from "@angular/core";
import { SubscribableComponent } from "ngx-subscribable";
import { StorageService } from "services/storage.service";
import { RoleAccessService } from "services/role-access.service";

import { not } from "logical-not";

import { EAppRoutes } from "enums/routing";
import { BackendQueryApiService } from "api/backend-query.api";
import { BackendManualApiService } from "api/backend-manual.api";
import { TCoinName } from "interfaces/coin";
import {
    IUserBalanceItem,
    IUserStats,
    IUserStatsItem,
    IUserHistoryInfo,
    IUserStatsHistoryItem,
    IWorkerStatsItem,
    IWorkerStatsHistoryItem,
    IWorkerHistoryInfo,
    IPoolCoinsItem,
    IPoolStatsItem,
    ICoinInfo,
} from "interfaces/backend-query";
import { ESuffix } from "pipes/suffixify.pipe";
import { CoinSwitchService } from "services/coinswitch.service";
import { FetchPoolDataService } from "services/fetchdata.service";
import { ERole } from "enums/role";

enum EWorkerState {
    Normal = "normal",
    Warning = "warning",
    Error = "error,",
}

@Component({
    selector: "app-monitoring",
    templateUrl: "./monitoring.component.html",
    styleUrls: ["./monitoring.component.less"],
})
export class MonitoringComponent extends SubscribableComponent
    implements OnInit, OnDestroy {
    readonly EAppRoutes = EAppRoutes;
    readonly EWorkerState = EWorkerState;
    readonly ESuffix = ESuffix;

    coinsList: TCoinName[];
    currentCoinName: TCoinName;
    currentCoinNameWorker: TCoinName;

    userBalances: IUserBalanceItem[];
    currentBalance: {
        balance?: string;
        paid?: string;
        requested?: string;
    };
    //    currentBalance: string = "";
    //    currentPaid: string = "";
    //    currentRequested: string = "";
    userStatsItem: IUserStatsItem;
    userStatsItemZeroUnitsOffset: number = 6;
    //userStatsHistory: IUserStatsHistoryItem[];
    //currentPowerMultLog10: number = 6;
    //stats: [] as IWorkerStatsItem[],
    //powerMultLog10: 0,
    //};
    currentWorkerId: string;
    //workersStatsList: IWorkerStatsItem[];
    //workerStatsHistoryReady: boolean;
    //workerStatsHistoryData: IWorkerStatsHistoryItem[];
    //workersStatsHistory: IWorkerHistoryInfo;
    userWorkersStatsList: IWorkerStatsItem[];

    userStatsHistory: {
        coin: TCoinName;
        stats: IUserStatsHistoryItem[];
        powerMultLog10: number;
    };

    userWorkersStatsHistory: {
        name: string;
        stats: IWorkerStatsItem[];
        powerMultLog10: number;
        coin: TCoinName;
        ready: boolean;
    };

    tableData = {
        isLoading: false,
        updateTimeoutId: null,
    };
    // acceptedDifficulty: number;
    /*
    get balance(): string {
        if (this.userBalances.length === 0 || this.currentCoinName === "sha256")
            return "0";

        return this.userBalances.find(item => {
            return item.coin === this.currentCoinName;
        }).balance;
    }
    get requested(): string {
        if (this.userBalances.length === 0 || this.currentCoinName === "sha256")
            return "0";

        return this.userBalances.find(item => {
            return item.coin === this.currentCoinName;
        }).requested;
    }
    get paid(): string {
        if (this.userBalances.length === 0 || this.currentCoinName === "sha256")
            return "0";

        return this.userBalances.find(item => {
            return item.coin === this.currentCoinName;
        }).paid;
    }
*/
    isManualPayoutSending = false;

    private ppdaUser: ERole = ERole.PPDAUser;
    //private isStarting: boolean = false;
    private currentAlgo: TCoinName;
    private nullBallance: string = "0.00";
    private currentCoinWorkerLiveStat: IWorkerStatsItem; // = {} as IWorkerStatsItem;
    private s1witchWorkerCoin: boolean = false;
    //    private currentCoinWorkerId: string;

    private loading = {
        coins: <boolean>false,
        balances: <boolean>false,
        liveStat: <boolean>false,
        userHistStat: <boolean>false,
        workerHistStat: <boolean>false,
    };

    constructor(
        private backendQueryApiService: BackendQueryApiService,
        private backendManualApiService: BackendManualApiService,
        private coinSwitchService: CoinSwitchService,
        private fetchPoolDataService: FetchPoolDataService,
        private storageService: StorageService,
        private roleAccessService: RoleAccessService,
    ) {
        super();
    }

    ngOnInit(): void {
        this.subscriptions = [
            //this.coinSwitchService.coinSwitch.subscribe(coinName => {
            //this.currentCoinName = coinName;
            //this.onCurrentCoinChange(coinName);
            //}),

            this.fetchPoolDataService.poolCoinsList.subscribe(coins => {
                if (coins.length !== 0) this.processPoolCoinsList(coins);
            }),

            this.fetchPoolDataService.subjUStats.subscribe(stats => {
                if (Object.keys(stats).length !== 0)
                    this.processUserLiveStats(stats);
            }),

            this.fetchPoolDataService.subjUStatsHist.subscribe(userHistory => {
                this.processUserStatsHistory(userHistory);
            }),

            this.fetchPoolDataService.subjUWStatsHist.subscribe(
                workerHistory => {
                    this.processWorkerStatsHistory(workerHistory);
                },
            ),

            this.fetchPoolDataService.subjUBalance.subscribe(balances => {
                this.processUserBalances(balances);
            }),
        ];

        this.loading.coins = true;
        this.tableData.isLoading = true;
        //this.workerStatsHistoryReady = false;
        this.fetchPoolDataService.fetchCoins();
        this.userWorkersStatsHistory = {
            name: "",
            stats: [],
            powerMultLog10: 6,
            coin: "",
            ready: false,
        };
    }

    ngOnDestroy(): void {
        clearTimeout(this.tableData.updateTimeoutId);
        this.subscriptions.forEach(el => el.unsubscribe);
    }

    onWorkerCurrentCoinChange(coinName: TCoinName): void {
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
        this.fetchPoolDataService.getUserCoinStats(coinName);
    }

    onCurrentCoinChange(coinName: TCoinName): void {
        if (coinName === "" || this.loading.coins)
            //|| this.switchWorkerCoin)
            return;
        this.currentCoinName = coinName;
        this.fetchData(coinName);
        this.periodicCall(coinName);
    }

    onWorkerRowClick(workerId: string): void {
        if (workerId === "" || this.loading.coins) return;
        //this.storageService.needWorkerInint = true;
        this.fetchWorkerData(workerId, this.currentCoinName);
        /*
        var lastPower = this.userWorkersStatsList.find(item => {
            return item.name === workerId;
        }).power;
        let timeFrom =
            ((new Date().valueOf() / 1000) as any).toFixed(0) -
            3 * 24 * 60 * 60;
        let groupByInterval = 15 * 60;
        this.backendQueryApiService
            .getWorkerStatsHistory({
                coin: this.currentCoinName,
                workerId,
                timeFrom,
                groupByInterval,
            })
            .subscribe(({ stats, powerMultLog10, currentTime }) => {
                if (stats.length > 0) {
                    const lastStatTime = stats[stats.length - 1].time;
                    if (currentTime < lastStatTime) {
                        stats[stats.length - 1].time = currentTime;
                        stats[stats.length - 1].power = lastPower;
                    }
                    if (stats.length > 2) stats.shift();
                    this.userWorkersStatsHistory = {
                        name: workerId,
                        stats,
                        powerMultLog10,
                    };
                }
            });*/
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
        this.userWorkersStatsHistory = {
            name: "",
            stats: [],
            powerMultLog10: 6,
            coin: "",
            ready: false,
        };
        //this.workerStatsHistoryReady = false;
        //this.userWorkersStatsHistory = null;
        this.storageService.currentCoinInfoWorker = null;
        this.storageService.currentWorkerName = null;
        //this.storageService.needWorkerInint = false;
    }

    private processPoolCoinsList(coins: IPoolCoinsItem[]) {
        if (coins.length > 0) {
            this.storageService.poolCoins = coins;
            this.storageService.currentCoinInfo = coins[coins.length - 1];
            this.coinsList = coins.map(item => item.name);
            this.currentCoinName = coins[coins.length - 1].name;
            this.currentCoinNameWorker = coins[coins.length - 1].name;
            this.currentAlgo = coins[coins.length - 1].algorithm;

            if (!this.loading.liveStat) {
                this.loading.liveStat = true;
                this.fetchPoolDataService.getUserCoinStats();
            }
        }
        this.loading.coins = false;
    }

    private processUserLiveStats(stats: IUserStats) {
        if (this.loading.coins || Object.keys(stats).length === 0) return;
        this.storageService.currentUserliveStat = stats;
        this.userStatsItem = stats.total;
        this.userStatsItemZeroUnitsOffset = stats.powerMultLog10;

        this.userWorkersStatsList = stats.workers;
        //this.userWorkersStatsHistory.
        if (this.loading.workerHistStat)
            this.fetchWorkerData(
                this.currentWorkerId,
                this.currentCoinNameWorker,
            );

        if (!this.loading.userHistStat && !this.loading.workerHistStat) {
            this.loading.userHistStat = true;
            this.fetchPoolDataService.getUserCoinStatsHistory();
        }
        this.loading.liveStat = false;
    }

    private processUserBalances(userBalances) {
        if (this.loading.coins) return;

        if (
            userBalances.length !== 0 &&
            this.currentCoinName !== this.currentAlgo
        ) {
            this.userBalances = userBalances as IUserBalanceItem[];
            this.currentBalance.balance = this.userBalances.find(item => {
                return item.coin === this.currentCoinName;
            }).balance;
            this.currentBalance.paid = this.userBalances.find(item => {
                return item.coin === this.currentCoinName;
            }).paid;
            this.currentBalance.requested = this.userBalances.find(item => {
                return item.coin === this.currentCoinName;
            }).requested;
        } else if (this.currentCoinName !== this.currentAlgo) {
            this.currentBalance.balance = this.nullBallance;
            this.currentBalance.paid = this.nullBallance;
            this.currentBalance.requested = this.nullBallance;
        } else {
            this.currentBalance = {};
        }
        this.loading.balances = false;
    }

    private processUserStatsHistory(userHistory) {
        if (this.loading.coins) return;

        this.userStatsHistory = {
            coin: this.currentCoinName,
            stats: userHistory.stats,
            powerMultLog10: userHistory.powerMultLog10,
        };
        //this.currentPowerMultLog10 = userHistory.powerMultLog10;
        this.tableData.isLoading = false;
        this.loading.userHistStat = false;
    }

    private processWorkerStatsHistory(workerHistory: IWorkerHistoryInfo) {
        if (this.loading.coins) return;

        //this.switchWorkerCoin = false;
        if (Object.keys(workerHistory).length === 0) return;
        //this.currentWorkerId = workerHistory.workerId;
        this.userWorkersStatsHistory = {
            name: workerHistory.workerId,
            stats: workerHistory.stats,
            powerMultLog10: workerHistory.powerMultLog10,
            coin: this.currentCoinNameWorker,
            ready: true,
        };
        this.loading.workerHistStat = false;
    }

    private fetchData(coinName: TCoinName) {
        if (this.loading.coins) return;
        if (coinName === "") return;
        //this.userStatsHistory = null;
        this.currentCoinName = coinName;
        //this.currentCoinNameWorker = coinName;
        //this.workerStatsHistory = null;

        const coins = this.storageService.poolCoins;
        this.storageService.currentCoinInfo = coins.find(
            item => item.name === coinName,
        );

        this.tableData.isLoading = true;
        if (!this.loading.liveStat) {
            this.loading.liveStat = true;
            this.fetchPoolDataService.getUserCoinStats();
        }
    }

    private fetchWorkerData(workerId: string, coinName: TCoinName) {
        if (this.loading.coins || this.loading.liveStat || workerId === "")
            return;

        //this.workerStatsHistory = null;

        this.currentWorkerId = workerId;
        const coins = this.storageService.poolCoins;
        this.storageService.currentCoinInfoWorker = coins.find(
            item => item.name === coinName,
        );
        this.storageService.currentWorkerName = workerId;
        //this.storageService.chartsBaseData = null;
        //this.currentCoinWorkerId = coins[coins.length-1].name;

        //this.storageService.currentWorkerName = workerId;

        //this.tableData.isLoading = true;
        //this.currentCoinWorkerLiveStat = this.workersStatsList.find(item => {
        //return item.name === workerId;
        //});
        this.fetchPoolDataService.getUserWorkerCoinStatsHistory();
    }

    private periodicCall(coinName: TCoinName) {
        clearTimeout(this.tableData.updateTimeoutId);
        this.tableData.updateTimeoutId = setTimeout(() => {
            this.fetchData(coinName);
            this.periodicCall(coinName);
        }, 45 * 1000);
    }

    manualPayout(): void {
        this.isManualPayoutSending = true;
        const coin = this.currentCoinName;
        this.backendManualApiService.forcePayout({ coin }).subscribe(
            () => {
                this.isManualPayoutSending = false;
            },
            () => {
                this.isManualPayoutSending = false;
            },
        );
    }
    /*
    private reset() {
        this.storageService.poolCoins = null;
        this.storageService.currentCoinInfo = null;
        this.storageService.chartsTimeFrom = null;
        this.storageService.chartsBaseData = null;
        this.storageService.currentUserliveStat = null;
        this.storageService.currentWorkerName = null;
        this.storageService.userSettings = null;
        this.storageService.userCredentials = null;
    }
*/
    // private setAcceptedDifficulty(stats: IWorkerStatsItem[]): void {
    //     this.acceptedDifficulty = 0;

    //     const today = new Date().getDate();

    //     stats.forEach(item => {
    //         const date = new Date(item.time * 1000);

    //         if (date.getDate() === today && date.getHours()) {
    //             this.acceptedDifficulty += item.shareWork;
    //         }
    //     });
    // }
}
/*
    private getCoinsList(): void {
        this.backendQueryApiService.getPoolCoins().subscribe(({ coins }) => {
            if (coins.length >= 2) {
                coins.push({
                    name: coins[0].algorithm,
                    fullName: coins[0].algorithm,
                    algorithm: coins[0].algorithm,
                });
            }
            this.coins = coins.map(item => item.name);
            if (this.coins.length > 0) {
                const coin = this.coins.includes(coins[0].algorithm)
                    ? coins[0].algorithm
                    : this.coins[0];
                this.getUserStat(coin);

                this.onCurrentCoinChange(coin);
            }
        });
    }

    private getUserBalance(): void {
        this.backendQueryApiService
            .getUserBalance()
            .subscribe(({ balances }) => {
                this.userBalances = balances;
            });
    }

    private getUserStat(coinName: TCoinName): void {
        this.currentCoinName = coinName;
        this.updateTablesData();
    }

    private getUserStatsHistory(
        coinName: TCoinName,
        liveStats: IUserStatsItem,
    ): void {
        let timeFrom =
            ((new Date().valueOf() / 1000) as any).toFixed(0) -
            1.5 * 24 * 60 * 60;
        let groupByInterval = 30 * 60;
        this.backendQueryApiService
            .getUserStatsHistory({ coin: coinName, timeFrom, groupByInterval })
            .subscribe(({ stats, powerMultLog10, currentTime }) => {
                if (stats.length > 0) {
                    const lastStatTime = stats[stats.length - 1].time;
                    if (currentTime < lastStatTime) {
                        stats[stats.length - 1].time = liveStats.lastShareTime;
                        stats[stats.length - 1].power = liveStats.power;
                    }
                    if (stats.length > 2) stats.shift();
                    this.userStatsHistory = { stats, powerMultLog10 };
                }
            });
    }
    private updateTablesData(): void {
        this.tableData.isLoading = true;

        clearTimeout(this.tableData.updateTimeoutId);

        this.backendQueryApiService
            .getUserStats({ coin: this.currentCoinName })
            .subscribe({
                complete: () => {
                    this.tableData.isLoading = false;

                    this.tableData.updateTimeoutId = setTimeout(() => {
                        this.updateTablesData();
                    }, 45000);
                },
                next: ({ total, workers, currentTime, powerMultLog10 }) => {
                    workers.forEach(item => {
                        item.lastShareTime = currentTime - item.lastShareTime;
                    });
                    workers.sort((a, b) => {
                        return b.lastShareTime - a.lastShareTime;
                    });

                    this.userStatsItem = total;
                    this.getUserStatsHistory(this.currentCoinName, total);
                    this.getUserBalance();
                    this.userStatsItemZeroUnitsOffset = powerMultLog10;
                    this.userWorkersStatsList = workers;
                    this.tableData.isLoading = false;
                },
            });
    }
*/
