import { Component } from '@angular/core';
import { EAppRoutes } from 'enums/routing';
import { DefaultParams } from 'components/defaults.component';

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
})
export class FooterComponent {
    readonly EAppRoutes = EAppRoutes;
    readonly guiVersion = DefaultParams.GUIVERSION;
}
