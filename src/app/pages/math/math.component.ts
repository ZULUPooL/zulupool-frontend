import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DefaultParams } from 'components/defaults.component';

@Component({
    selector: 'app-math',
    templateUrl: './math.component.html',
    styleUrls: ['./math.component.less'],
})
export class MathComponent implements OnInit {
    constructor(private translateService: TranslateService) {}

    discordLink: string;
    emailAddr: string;

    ngOnInit(): void {
        this.discordLink = DefaultParams.DISCORDSERVER;
        this.emailAddr = DefaultParams.SUPPORTMAIL;
    }
}
