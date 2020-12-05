import { Component } from '@angular/core';
import { EAppRoutes } from 'enums/routing';

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
})
export class FooterComponent {
    readonly EAppRoutes = EAppRoutes;
}
