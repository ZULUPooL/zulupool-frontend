import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { UserApiService } from 'api/user.api';
import { IUserSettings } from 'interfaces/user';
import { TCoinName } from 'interfaces/coin';
import { StorageService } from 'services/storage.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-profit-settings',
    templateUrl: './profit-settings.component.html',
    styleUrls: ['./profit-settings.component.less'],
})
export class ProfitSettingsComponent implements OnInit {
    profitItems: IProfitSett[];
    selectedIndex: number;
    currentCoin: TCoinName;
    isStarting: boolean;
    form = this.formBuilder.group({
        profitSwitchCoeff: [],
    });
    isSubmitting = false;

    private disabledCoin: string;

    get isDisabled(): boolean {
        return this.currentCoin === this.disabledCoin || this.currentCoin === 'HTR';
    }

    constructor(
        private formBuilder: FormBuilder,
        private userApiService: UserApiService,
        private storageService: StorageService,
        private nzModalService: NzModalService,
        private translateService: TranslateService,
    ) {}

    ngOnInit(): void {
        this.isStarting = true;
        this.getSettings();
    }
    onCurrentCoinChange(coin: TCoinName): void {
        if (this.isStarting) return;
        this.currentCoin = coin;
        let index = this.profitItems.findIndex(el => el.name === coin);
        this.form.patchValue(this.profitItems[index]);
    }

    changeCoin(): void {
        this.form.patchValue(this.profitItems[this.selectedIndex]);
    }

    save(): void {
        if (this.form.value.payoutThreshold === null || this.form.value.address === null) return;
        this.isSubmitting = true;

        const index = this.profitItems.findIndex(el => el.name === this.currentCoin);
        let coinName = this.profitItems[index].name;
        const coinObj = this.storageService.coinsObj[coinName];
        if (coinObj.is.nameSplitted) coinName = coinObj.info.name + '.' + coinObj.info.algorithm;
        const value = this.form.value.profitSwitchCoeff;

        const jsonValue = JSON.stringify(value, function (key, val) {
            if (typeof val === 'number') return '<<<' + val.toFixed(3) + '>>>';
            return val;
        }).replace(/"<<<|>>>"/g, '');

        const data = {
            profitSwitchCoeff: jsonValue,
            coin: coinName,
        };

        this.userApiService.updateProfitSwitchCoeff(data).subscribe(
            () => {
                this.nzModalService.success({
                    nzContent: this.translateService.instant('settings.form.success', {
                        coinName: this.currentCoin,
                    }),
                    nzOkText: this.translateService.instant('common.ok'),
                });
                this.isSubmitting = false;
            },
            () => {
                this.isSubmitting = false;
            },
        );
    }

    private getSettings(): void {
        this.userApiService.queryProfitSwitchCoeff().subscribe((data: IProfitSett[]) => {
            if (data.length > 0) {
                const coinObj = this.storageService.coinsObj;
                if (data.length > 2) {
                    const algoCoin = this.storageService.coinsList.find(coin => {
                        return coinObj[coin].is.algo;
                    });
                    const algoData =
                        data.find(coin => {
                            return coin.name === algoCoin;
                        }) || {};
                    if (algoCoin.length > 0 && Object.keys(algoData).length === 0) {
                        data.push({
                            name: algoCoin,
                            profitSwitchCoeff: 0.0,
                        });
                        this.disabledCoin = algoCoin;
                    }
                }
                data.forEach(coin => {
                    if (coin.name.split('.').length > 1) {
                        coin.name = coin.name.split('.')[0];
                    }
                });
            }
            this.profitItems = data;
            this.currentCoin = data[data.length - 1].name;
            this.isStarting = false;
            this.onCurrentCoinChange(this.currentCoin);
        });
    }
}

export interface IProfitSett {
    name: string;
    profitSwitchCoeff: number;
}
