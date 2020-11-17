import { Component, Input, OnChanges } from "@angular/core";
//import { formatDate } from "@angular/common";

//import { Label } from "ng2-charts";

import { IPoolStatsHistoryItem } from "interfaces/backend-query";
//import { LangService } from "services/lang.service";
//import { StorageService } from "services/storage.service";

@Component({
    selector: "app-chart-power",
    templateUrl: "./chart-power.component.html",
    styles: [":host { display: block }"],
})
export class ChartPowerComponent implements OnChanges {
    @Input()
    powerData: IChartData;
    /*powerData: {
        actualData: IPoolStatsHistoryItem[];
        prevData: IPoolStatsHistoryItem[];
        powerMultLog10: number;
        chartName: string;
    };*/

    chartData: IChartData;
    /*
    labels: Label[];
    data: number[];
    chartTitle: string;
*/
    constructor() {} // private storageService: StorageService, //private langService: LangService,

    ngOnChanges(): void {
        this.chartData = this.powerData;
    }
    //    onZoomChange(zoom: string) {}
    /*
    ngOnChanges(): void {

        /*
        //let data = {} as IChartData;
        //data.titleKey = this.powerData.chartName;
        const t = { any: "HH:mm", last: "HH:mm:ss" };
        const actualData = [...this.powerData.actualData];
        const prevData = [...this.powerData.prevData];
        const store = this.storageService.chartData[this.powerData.chartName],
            refresh = store.newPushed === 0 && store.oldShifted === 0;

        let data = [],
            labels = [],
            count = 0,
            titleKey = this.powerData.chartName;

        actualData.forEach(item => {
            count++;
            data.push(item.power);
            const date = formatDate(
                new Date(item.time * 1000),
                count === actualData.length ? t.last : t.any,
                this.langService.getCurrentLang(),
            );
            labels.push(date);
        });
        if (refresh) {
            this.setData({ data, labels, titleKey, refresh: true });
        } else {
            this.setData({ data, labels, titleKey, refresh: false });
        }
        //debugger;
    }

    private setNew(): void {
        const stats = [...this.powerData.actualData];
        const t = { any: "HH:mm", last: "HH:mm:ss" };
        let data = [],
            labels = [],
            count = 0,
            titleKey = this.powerData.chartName;
    }

    private setData(data: IChartData) {
        this.info = data;
    }*/
}

interface IChartData {
    actualData: IPoolStatsHistoryItem[];
    prevData: IPoolStatsHistoryItem[];
    powerMultLog10: number;
    chartName: string;
    clear?: boolean;
}
