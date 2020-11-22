import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EAppRoutes, EActionsRoutes } from 'enums/routing';
import { ERole } from 'enums/role';

import { AuthGuard } from 'guards/auth.guard';
import { RoleAccessGuard } from 'guards/role-access.guard';

import { MainLayoutComponent } from 'components/main-layout/main-layout.component';
import { UserLayoutComponent } from 'components/user-layout/user-layout.component';

import { HomeComponent } from 'pages/home/home.component';
import { AuthComponent } from 'pages/auth/auth.component';
import { MonitoringComponent } from 'pages/monitoring/monitoring.component';
import { HistoryComponent } from 'pages/history/history.component';
import { PageNotFoundComponent } from 'pages/404/page-not-found.component';
import { UserActivateComponent } from 'pages/actions/user-activate/user-activate.component';
import { UserResendEmailComponent } from 'pages/user-resend-email/user-resend-email.component';
import { HelpComponent } from 'pages/help/help.component';
import { UsersComponent } from 'pages/users/users.component';
import { PayoutsComponent } from 'pages/payouts/payouts.component';
import { SettingsComponent } from 'pages/settings/settings.component';
import { CreateUserComponent } from 'pages/createuser/createuser.component';
import { LandingComponent } from 'pages/landing/landing.component';

const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        // redirectTo: EAppRoutes.Monitoring,
        component: MainLayoutComponent,
        children: [
            {
                path: EAppRoutes.Landing,
                pathMatch: 'full',
                component: LandingComponent,
            },
            {
                path: EAppRoutes.Home,
                pathMatch: 'full',
                component: HomeComponent,
            },
            {
                path: EAppRoutes.Help,
                pathMatch: 'full',
                component: HelpComponent,
            },
        ],
    },
    {
        path: EAppRoutes.Auth,
        component: AuthComponent,
    },
    {
        path: EAppRoutes.UserResendEmail,
        component: UserResendEmailComponent,
    },
    {
        path: EAppRoutes.Actions,
        children: [
            {
                path: EActionsRoutes.UserActivate,
                component: UserActivateComponent,
            },
        ],
    },
    {
        path: '',
        component: UserLayoutComponent,
        children: [
            {
                path: EAppRoutes.Monitoring,
                component: MonitoringComponent,
                data: {
                    permission: [
                        ERole.SuperUser,
                        ERole.Observer,
                        ERole.ReadOnlyUser,
                        ERole.User,
                        ERole.PPDAUser,
                    ],
                },
            },
            {
                path: EAppRoutes.History,
                component: HistoryComponent,
                data: {
                    permission: [
                        ERole.SuperUser,
                        ERole.Observer,
                        ERole.ReadOnlyUser,
                        ERole.User,
                        ERole.PPDAUser,
                    ],
                },
            },
            {
                path: EAppRoutes.Users,
                component: UsersComponent,
                data: {
                    permission: ERole.SuperUser,
                },
            },
            {
                path: EAppRoutes.Payouts,
                component: PayoutsComponent,
            },
            {
                path: EAppRoutes.Settings,
                component: SettingsComponent,
            },
            {
                path: EAppRoutes.CreateUser,
                component: CreateUserComponent,
                data: {
                    permission: ERole.SuperUser,
                },
            },
            {
                path: '**',
                component: PageNotFoundComponent,
            },
        ],
        canActivate: [AuthGuard, RoleAccessGuard],
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
