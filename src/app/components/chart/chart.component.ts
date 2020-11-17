import { Component, Input, OnInit, OnChanges, ViewChild } from "@angular/core";

import { ChartDataSets, ChartOptions } from "chart.js";
import { Label, BaseChartDirective } from "ng2-charts";
import { formatDate } from "@angular/common";

import { TranslateService } from "@ngx-translate/core";
import { SubscribableComponent } from "ngx-subscribable";

import { LangService } from "services/lang.service";
import { ThemeService } from "services/theme.service";
import { StorageService } from "services/storage.service";

import { IPoolStatsHistoryItem } from "interfaces/backend-query";

@Component({
    selector: "app-chart",
    templateUrl: "./chart.component.html",
    styleUrls: ["./chart.component.less"],
})
export class ChartComponent extends SubscribableComponent
    implements OnInit, OnChanges {
    @Input()
    chartData: {
        actualData: IPoolStatsHistoryItem[];
        prevData: IPoolStatsHistoryItem[];
        powerMultLog10: number;
        chartName: string;
        clear?: boolean;
        zoom?: boolean;
    };

    @ViewChild(BaseChartDirective)
    chartDirective: BaseChartDirective;

    chart: IChartSettings;

    tStamps: number[] = [];
    tmpStamps: number[] = [];
    tSuff: { all: string; last: string };

    constructor(
        //private translateService: TranslateService,
        private storageService: StorageService,
        private langService: LangService,
        private themeService: ThemeService, //private storageService: StorageService,
    ) {
        super();
    }

    onZoomChange(zoom: string) {}

    ngOnInit(): void {
        this.subscriptions.push(
            this.themeService.chartsColor.subscribe(() => {
                //                this.changeColors();
            }),
        );
    }

    ngOnChanges(): void {
        if (Object.keys(this.chartData).length === 0) return;
        //if (this.chartData.clear && )
        if (this.chartData.chartName === "")
            throw new Error("Something is wrong");

        this.tSuff = { all: "HH:mm", last: "HH:mm:ss" };
        if (
            this.chart === undefined ||
            this.chart.datasets.length === 0 ||
            this.chartData.zoom
        )
            this.createNewChart();
        else {
            const nameB = this.storageService.whatBase.name;
            if (this.chartData.chartName === nameB && this.chartData.clear) {
                while (this.chart.datasets.length > 1) {
                    const nameF = this.chart.datasets[0];
                    const nameL = this.chart.datasets[
                        this.chart.datasets.length - 1
                    ];
                    if (nameF !== nameB) this.chart.datasets.shift();
                    else if (nameL !== nameB) this.chart.datasets.pop();
                }
                const [r, g, b] = this.themeService.chartsColor.value;
                this.chart.datasets[0].borderColor = `rgb(${r}, ${g}, ${b})`;
                this.chart.datasets[0].backgroundColor = `rgba(${r}, ${g}, ${b}, .2)`;
            }
            this.updateData();
        }
    }

    private updateData(): void {
        const coin = this.chartData.chartName,
            dSets = this.chart.datasets,
            dSetsL = dSets.length;
        let dSetI = 0;
        while (dSetI < dSetsL && dSets[dSetI].label !== coin) dSetI++;
        if (dSetI >= dSetsL) {
            this.createNewDataset();
        } else this.fixLabelsAndFill(dSetI);
    }

    // OK
    private fixLabelsAndFill(dsI: number) {
        const langService = this.langService;
        let goNext = this.tStamps.length > 0,
            tmp = 0;
        const canShift =
            this.storageService.whatBase.name === this.chartData.chartName;
        while (goNext) {
            if (!canShift) break;
            const newTime = this.chartData.actualData[0].time;
            const prevTime = this.tStamps[0];
            if (prevTime < newTime) {
                this.chart.datasets.forEach(el => {
                    el.data.shift();
                });
                this.chart.labels.shift();
                this.tStamps.shift();
            } else goNext = false;
            goNext = this.tStamps.length !== 0 && goNext;
            if (tmp > 1000) throw new Error("Something is wrong in checkShift");
            else tmp++;
        }

        const tSl = this.tStamps.length;
        const chL = this.chartData.actualData.length;
        let dsL = this.chart.datasets[dsI].data.length;
        for (let i = 0; i < chL; i++) {
            const el = this.chartData.actualData[i];
            const lastNewData = i === chL - 1;
            if (i >= dsL) {
                this.chart.datasets[dsI].data.push(el.power);
                dsL++;
            }

            if (i === tSl - 1) {
                this.chart.labels[i] = getStr(el.time, lastNewData);
                if (i < dsL) {
                    this.chart.datasets[dsI].data[i] = el.power;
                }
            }
            if (i >= tSl) {
                if (canShift) {
                    this.chart.labels.push(getStr(el.time, lastNewData));
                    this.tStamps.push(el.time);
                }
                if (i < dsL) {
                    this.chart.datasets[dsI].data[i] = el.power;
                }
            }
        }
        this.setBase();
        function getStr(time: number, bool: boolean): string {
            let str = bool ? "HH:mm:ss" : "HH:mm";
            return formatDate(
                new Date(time * 1000),
                str,
                langService.getCurrentLang(),
            );
        }
    }

    private setBase() {
        const baseCoin = this.storageService.whatBase.name,
            currCoin = this.chartData.chartName;
        if (baseCoin === currCoin)
            this.storageService.chartData[baseCoin].timeFrom = this.tStamps[0];
    }
    private createNewChart(): void {
        /*const tsL = this.tStamps.length - 1;

        if (
            tsL > 0 &&
            this.tStamps[tsL] === this.chartData.actualData[tsL].time
        )
            return;
*/
        this.tStamps = [] as any;
        const langService = this.langService;
        const coin = this.chartData.chartName;
        const [r, g, b] = this.themeService.chartsColor.value;
        this.chart = {
            datasets: [
                {
                    label: coin,
                    data: [],
                    borderColor: `rgb(${r}, ${g}, ${b})`,
                    backgroundColor: `rgba(${r}, ${g}, ${b}, .2)`,
                    pointBackgroundColor: "rgba(0,0,0,0)",
                    pointBorderColor: "rgba(0,0,0,0)",
                    spanGaps: true,
                },
            ],
            labels: [],
            options: {
                scales: {
                    xAxes: [
                        {
                            gridLines: {
                                color: this.themeService.gridLinesColorX,
                            },
                        },
                    ],
                    yAxes: [
                        {
                            gridLines: {
                                color: this.themeService.gridLinesColorY,
                            },
                        },
                    ],
                },
            },
        };
        const data = this.chartData.actualData;
        let c = 0,
            last: boolean,
            str: string;

        data.forEach(el => {
            last = c === this.chartData.actualData.length - 1;
            str = getStr(el.time, last);
            this.chart.labels.push(str);
            this.tStamps.push(el.time);
            this.chart.datasets[0].data.push(el.power);
            c++;
        });
        this.setBase();
        function getStr(time: number, lats: boolean): string {
            let str = last ? "HH:mm:ss" : "HH:mm";
            return formatDate(
                new Date(time * 1000),
                str,
                langService.getCurrentLang(),
            );
        }
    }

    private createNewDataset() {
        const coin = this.chartData.chartName;
        let goNext = true;
        let r2, g2, b2;
        let tmp = 0;
        while (goNext && tmp < 5000) {
            // майним новый цвет
            r2 = Math.floor(Math.random() * 255 + 1);
            g2 = Math.floor(Math.random() * 255 + 1);
            b2 = Math.floor(Math.random() * 255 + 1);

            for (let i = 0; i < this.chart.datasets.length; i++) {
                const el = this.chart.datasets[i];
                const str = el.borderColor as string;
                const arr = str.split(",");
                const r = arr[0].split("(")[1];
                const g = arr[1];
                const b = arr[2].split(")")[0];
                if (coldiff(r, g, b, r2, g2, b2) > 495) goNext = false;
            }
            tmp++;
        }

        this.chart.datasets.push({
            label: coin,
            data: [],
            borderColor: `rgb(${r2}, ${g2}, ${b2})`,
            backgroundColor: `rgba(${r2}, ${g2}, ${b2}, .2)`,
            pointBackgroundColor: "rgba(0,0,0,0)",
            pointBorderColor: "rgba(0,0,0,0)",
            spanGaps: true,
        });
        this.fixLabelsAndFill(this.chart.datasets.length - 1);

        function coldiff($R1, $G1, $B1, $R2, $G2, $B2) {
            return (
                Math.max($R1, $R2) -
                Math.min($R1, $R2) +
                Math.max($G1, $G2) -
                Math.min($G1, $G2) +
                Math.max($B1, $B2) -
                Math.min($B1, $B2)
            );
        }
    }

    private get1Str(time: number, lats: boolean): string {
        return formatDate(
            new Date(time * 1000),
            lats ? this.tSuff.last : this.tSuff.all,
            this.langService.getCurrentLang(),
        );
    }
}

interface IChartSettings {
    datasets: ChartDataSets[];
    labels: Label[];
    options: ChartOptions;
}

interface IChartData {
    labels: Label[];
    data: number[];
    titleKey: string;
    refresh: boolean;
}
