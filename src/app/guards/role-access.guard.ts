import { Injectable } from '@angular/core';
import {
    CanActivate,
    ActivatedRouteSnapshot,
    UrlTree,
    Router,
    RouterStateSnapshot,
} from '@angular/router';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { RoleAccessService } from 'services/role-access.service';
import { EUserRoles } from 'enums/role';
import { userRootRoute } from 'enums/routing';

@Injectable({
    providedIn: 'root',
})
export class RoleAccessGuard implements CanActivate {
    constructor(private router: Router, private roleAccessService: RoleAccessService) {}
    canActivate(
        data: ActivatedRouteSnapshot,
        state: RouterStateSnapshot,
    ): Observable<boolean | UrlTree> {
        //debugger;
        const route = state.url.slice(1, state.url.length);
        const rConf = data.routeConfig.children;
        const accessFor = rConf.find(item => item?.path === route).data.accessFor || 'user';
        const disabledFor = rConf.find(item => item?.path === route).data.disabledFor || 'none';
        return this.roleAccessService.hasAccess(accessFor as EUserRoles).pipe(
            map(hasAccess => {
                if (hasAccess && disabledFor === 'none') return hasAccess;
                else return this.router.parseUrl(userRootRoute);
            }),
        );
    }
}
