import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { StorageService } from 'services/storage.service';
import { CoinSwitchService } from 'services/coinswitch.service';
//import { ICoinsList, TCoinName } from 'interfaces/coin';
//import { IPoolCoinsItem } from 'interfaces/backend-query';
//import { BackendQueryApiService } from 'api/backend-query.api';
//import { SubscribableComponent } from 'ngx-subscribable';
import { FetchPoolDataService } from 'services/fetchdata.service';
import { Router } from '@angular/router';
//import { EAppRoutes } from 'enums/routing';
import { ThemeService } from 'ng2-charts';

@Component({
    selector: 'app-coin-switcher',
    templateUrl: './coin-switcher.component.html',
    styleUrls: ['./coin-switcher.component.less'],
})
export class CoinSwitcherComponent implements OnInit {
    //    readonly EAppRoutes = EAppRoutes;

    @Output()
    onChange = new EventEmitter<string>();

    coin: string;
    coins: string[];
    selectedAlgo: number;
    algos: string[];
    coinsListLoading: boolean;

    constructor(private coinSwitchService: CoinSwitchService, private storageService: StorageService, private fetchPoolDataService: FetchPoolDataService, private router: Router) {}

    ngOnInit(): void {
        this.coinsListLoading = false;
        this.fetchPoolDataService.apiGetListOfCoins.subscribe(data => {
            if (data.status && data.type === this.storageService.currType) {
                this.processCoins(data);
            }
        });
    }

    cangeCoin(newCoin: string) {
        this.coinSwitchService.setCoin(newCoin);
        this.onChange.emit(newCoin);
    }
    onAlgoChange(): void {
        const prevCoins = this.coins;
        const prevAlgo = this.storageService.currAlgo;
        let needAlgo = false;
        prevCoins.forEach(coin => {
            needAlgo = coin === prevAlgo;
        });

        this.storageService.coinsList = [];
        if (needAlgo) {
            this.storageService.algoCoinsData[this.algos[this.selectedAlgo]].forEach(coin => this.storageService.coinsList.push(coin.name));
        } else {
            this.storageService.algoCoinsData[this.algos[this.selectedAlgo]].forEach(coin => {
                if (coin.name !== this.algos[this.selectedAlgo]) this.storageService.coinsList.push(coin.name);
            });
        }

        //this.storageService.algoCoinsData[this.algos[this.selectedAlgo]].forEach(coin => this.storageService.coinsList.push(coin.name));
        this.coins = this.storageService.coinsList;
        this.storageService.currAlgo = this.algos[this.selectedAlgo];
        this.coin = this.coins[this.coins.length - 1];
        this.cangeCoin(this.coin);
        //
        //this.storageService.targetUser = this.usersItems[this.selectedIndex].login;
        //this.onTargetChange.emit(this.storageService.targetUser);
    }

    private processCoins(data) {
        const url = this.router.routerState.snapshot.url.slice(1);
        //let maxL = 1;
        //if (url === 'payouts' || url === 'settings') maxL = 2;
        this.algos = this.storageService.algosList;
        //this.selectedAlgo = this.algos.length - 1;
        this.selectedAlgo = 0;
        this.storageService.coinsList = [];
        this.storageService.algoCoinsData[this.algos[this.selectedAlgo]].forEach(coin => this.storageService.coinsList.push(coin.name));
        this.coins = this.storageService.coinsList;
        this.storageService.currAlgo = this.algos[this.selectedAlgo];

        if (this.storageService.coinsList.length > 2) {
            if (url === 'payouts' || url === 'settings') {
                this.coins = [];
                this.storageService.coinsList.forEach(el => {
                    if (el !== 'sha256' && el !== 'scrypt') this.coins.push(el);
                });
            }
        }

        this.coin = this.coins[this.coins.length - 1];
        //const coinI =
        //this.storageService.coinsList.length > 2
        //? this.storageService.coinsList.length - maxL
        //: 0;
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
        this.coinsListLoading = this.coins.length > 1;
        this.cangeCoin(this.coin);
    }
}
