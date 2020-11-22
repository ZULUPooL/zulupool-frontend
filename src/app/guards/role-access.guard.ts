import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, UrlTree, Router } from '@angular/router';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { RoleAccessService } from 'services/role-access.service';
import { ERole } from 'enums/role';
import { userRootRoute } from 'enums/routing';

@Injectable({
    providedIn: 'root',
})
export class RoleAccessGuard implements CanActivate {
    constructor(private router: Router, private roleAccessService: RoleAccessService) {}
    canActivate({ data: { permission } }: ActivatedRouteSnapshot): Observable<boolean | UrlTree> {
        //debugger;
        return this.roleAccessService.hasAccess(permission as ERole).pipe(
            map(hasAccess => {
                return hasAccess || this.router.parseUrl(userRootRoute);
            }),
        );
    }
}
