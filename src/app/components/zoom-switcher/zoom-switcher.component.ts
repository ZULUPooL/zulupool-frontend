import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ZoomSwitchService } from 'services/zoomswitch.service';
import { StorageService } from 'services/storage.service';
import { FetchPoolDataService } from 'services/fetchdata.service';

@Component({
    selector: 'app-zoom-switcher',
    templateUrl: './zoom-switcher.component.html',
    styleUrls: ['./zoom-switcher.component.less'],
})
export class ZoomSwitcherComponent implements OnInit {
    @Output()
    onChange = new EventEmitter<string>();

    activeZoom: string;
    zooms: string[];
    zoomListReady: boolean;

    constructor(
        private zoomSwitchService: ZoomSwitchService, //private fetchPoolDataService: FetchPoolDataService,
        private storageService: StorageService,
        private fetchPoolDataService: FetchPoolDataService,
    ) {}

    ngOnInit(): void {
        this.zoomListReady = false;
        this.activeZoom = this.storageService.whatZoom;
        this.zooms = this.storageService.whatZooms;
        this.zoomListReady = true;
        this.cangeZoom(this.activeZoom);

        //this.coinsListReady = false;
        //this.fetchPoolDataService.getCoinsData.subscribe(data => {
        //if (Object.keys(data).length > 0) this.processCoins(data);
        //});
    }

    ngOnDestroy(): void {
        //this.fetchPoolDataService.getCoinsData.unsubscribe();
    }

    cangeZoom(newZoom: string) {
        this.zoomSwitchService.setZoom(newZoom);
        this.onChange.emit(newZoom);
    }
    /*
    private processCoins(data) {
        const i = data.msg.length > 2 ? data.msg.length - 1 : 0;
        this.activeCoinName = data.msg[i].name;
        this.poolCoins = data.msg;
        this.coinsListReady = true;
        this.cangeCoin(this.activeCoinName);
    } */
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
