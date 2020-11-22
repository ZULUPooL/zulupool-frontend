import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { StorageService } from 'services/storage.service';
import { CoinSwitchService } from 'services/coinswitch.service';
import { ICoinsList, TCoinName } from 'interfaces/coin';
import { IPoolCoinsItem } from 'interfaces/backend-query';
import { BackendQueryApiService } from 'api/backend-query.api';
import { SubscribableComponent } from 'ngx-subscribable';
import { FetchPoolDataService } from 'services/fetchdata.service';

@Component({
    selector: 'app-coin-switcher',
    templateUrl: './coin-switcher.component.html',
    styleUrls: ['./coin-switcher.component.less'],
})
export class CoinSwitcherComponent implements OnInit {
    @Output()
    onChange = new EventEmitter<TCoinName>();

    //    activeCoinName: TCoinName;
    //    poolCoins: IPoolCoinsItem[];
    coin: string;
    coins: string[];

    coinsListLoading: boolean;

    constructor(
        private coinSwitchService: CoinSwitchService,
        private storageService: StorageService,
        private fetchPoolDataService: FetchPoolDataService,
    ) {}

    ngOnInit(): void {
        this.coinsListLoading = false;
        this.fetchPoolDataService.apiGetListOfCoins.subscribe(data => {
            if (data.status && data.type !== '') this.processCoins(data);
        });

        //this.fetchPoolDataService.getCoinsData.subscribe(data => {
        //if (Object.keys(data).length > 0) this.processCoins(data);
        //});
    }

    ngOnDestroy(): void {
        //this.fetchPoolDataService.apiGetListOfCoins.unsubscribe();
    }

    cangeCoin(newCoin: TCoinName) {
        this.coinSwitchService.setCoin(newCoin);
        this.onChange.emit(newCoin);
    }

    private processCoins(data) {
        const coinI =
            this.storageService.coinsList.length > 2 ? this.storageService.coinsList.length - 1 : 0;
        this.coin = this.storageService.coinsList[coinI];
        this.coins = this.storageService.coinsList;
        const coinObjIs = this.storageService.coinsObj[this.coin].is;

        coinObjIs.chartMain = true;
        coinObjIs.chartRefresh = true;
        coinObjIs.liveVisible = true;

        if (data.type === 'pool') {
            coinObjIs.pool = data.type === 'pool';
            coinObjIs.blocksVisible = !coinObjIs.algo;
        } else if (data.type === 'user') {
            coinObjIs.user = data.type === 'user';
            coinObjIs.balanseVisible = !coinObjIs.algo;
        } else if (data.type === 'worker') {
            coinObjIs.worker = data.type === 'worker';
        }

        this.coinsListLoading = true;
        this.cangeCoin(this.coin);

        //this.mainChartCoin = coin;
        //this.getLiveInfo();

        //this.historyFetcher();
        //this.blocksFetch();
    }
    /*
    private processCoins() {
        this.coins = this.storageService.coinsList;
        const i = this.coins.length > 2 ? this.coins.length - 1 : 0;
        this.coin = this.coins[i];
        this.ready = true;
        this.cangeCoin(this.coin);
    }*/
}

/*


import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { StorageService } from "services/storage.service";
import { CoinSwitchService } from "services/coinswitch.service";
import { ICoinsList, TCoinName } from "interfaces/coin";
import { IPoolCoinsItem } from "interfaces/backend-query";
import { BackendQueryApiService } from "api/backend-query.api";

@Component({
    selector: "app-coin-switcher",
    templateUrl: "./coin-switcher.component.html",
    styleUrls: ["./coin-switcher.component.less"],
})
export class CoinSwitcherComponent implements OnInit {
    @Output()
    onChange = new EventEmitter<TCoinName>();

    get getCurrentCoinName(): TCoinName | null {
        return this.activeCoinName as TCoinName;
    }

    get getCoinsList(): IPoolCoinsItem[] | null {
        return this.poolCoins as IPoolCoinsItem[];
    }

    //    public currentCoin = <TCoinName>"";
    //public coinsList = <ICoinsList[]>[];
    public activeCoinName = <TCoinName>"";
    public poolCoinsName = <TCoinName[]>[];
    public poolCoins = <IPoolCoinsItem[]>[];

    constructor(
        private storageService: StorageService,
        private coinSwitchService: CoinSwitchService,
        private backendQueryApiService: BackendQueryApiService,
    ) {}
*/
/*onCurrentCoinChange(coin: TCoinName): void {
        this.storageService.currentCoin = coin;
    }*/
/*  ngOnInit(): void {





        if (this.storageService.currentCoinInfo === null || true) {
            this.backendQueryApiService
                .getPoolCoins()
                .subscribe(({ coins }) => {
                    if (coins.length > 1) {
                        coins.push({
                            name: coins[0].algorithm,
                            fullName: coins[0].algorithm,
                            algorithm: coins[0].algorithm,
                        });
                    }

                    if (coins.length > 0) {
                        this.storageService.currentCoinInfo = coins[
                            coins.length - 1
                        ] as IPoolCoinsItem;
                        this.storageService.poolCoins = coins as IPoolCoinsItem[];
                        this.initCoins();
                    }
                });
        } else {
            this.initCoins();
        }
    }
    private initCoins(): void {
        const currentCoin =
            this.storageService.currentCoinInfo || <IPoolCoinsItem>{};
        const coinsList = this.storageService.poolCoins || <IPoolCoinsItem[]>[];
        this.activeCoinName = currentCoin.name;
        this.poolCoinsName = coinsList.map(item => item.name);
        this.poolCoins = coinsList;
        this.cangeCoin(this.activeCoinName);
    }

    public cangeCoin(newCoin: TCoinName) {
        this.coinSwitchService.setCoin(newCoin);

        this.onChange.emit(newCoin);
    }
}
*/
/*


*/
