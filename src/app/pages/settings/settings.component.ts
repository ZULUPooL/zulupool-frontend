import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { UserApiService } from 'api/user.api';
import { IUserSettings } from 'interfaces/user';
import { TCoinName } from 'interfaces/coin';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.less'],
})
export class SettingsComponent implements OnInit {
    settingsItems: IUserSettings[];
    selectedIndex: number;
    currentCoin: TCoinName;

    form = this.formBuilder.group({
        address: [],
        payoutThreshold: [],
        autoPayoutEnabled: [],
    } as Record<keyof IUserSettings, any>);
    isSubmitting = false;

    constructor(private formBuilder: FormBuilder, private userApiService: UserApiService) {}

    ngOnInit(): void {
        this.userApiService.userGetSettings().subscribe(({ coins }) => {
            if (coins.length > 0) {
                this.settingsItems = coins;
                this.currentCoin = coins[0].name;
                this.changeCoin();
            }
        });
    }
    onCurrentCoinChange(coin: TCoinName): void {
        this.currentCoin = coin;
        let index = this.settingsItems.findIndex(el => el.name === coin);
        this.form.patchValue(this.settingsItems[index]);
    }

    changeCoin(): void {
        this.form.patchValue(this.settingsItems[this.selectedIndex]);
    }

    save(): void {
        if (this.form.value.payoutThreshold === null || this.form.value.address === null) return;
        this.isSubmitting = true;

        let index = this.settingsItems.findIndex(el => el.name === this.currentCoin);

        const data = {
            ...this.form.value,
            coin: this.settingsItems[index].name,
        };

        this.userApiService.userUpdateSettings(data).subscribe(
            () => {
                this.isSubmitting = false;
            },
            () => {
                this.isSubmitting = false;
            },
        );
    }
}
