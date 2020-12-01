import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EAppRoutes, EActionsRoutes } from 'enums/routing';
import { EUserRoles, EUsersState } from 'enums/role';

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
import { ProfitSettingsComponent } from 'pages/profit-settings/profit-settings.component';
import { ConnectComponent } from 'pages/connect/connect.component';

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
                path: EAppRoutes.Connect,
                component: ConnectComponent,
                data: {
                    accessFor: EUserRoles.User,
                    disabledFor: 'none',
                },
            },
            {
                path: EAppRoutes.Monitoring,
                component: MonitoringComponent,
                data: {
                    accessFor: EUserRoles.User,
                    disabledFor: 'none',
                },
            },
            {
                path: EAppRoutes.History,
                component: HistoryComponent,
                data: {
                    accessFor: EUserRoles.User,
                    disabledFor: 'none',
                },
            },
            {
                path: EAppRoutes.Payouts,
                component: PayoutsComponent,
                data: {
                    accessFor: EUserRoles.User,
                    disabledFor: 'none',
                },
            },
            {
                path: EAppRoutes.Settings,
                component: SettingsComponent,
                data: {
                    accessFor: EUserRoles.User,
                    disabledFor: EUsersState.ReadOnly,
                },
            },
            {
                path: EAppRoutes.Users,
                component: UsersComponent,
                data: {
                    accessFor: EUserRoles.Admin,
                    disabledFor: EUsersState.ReadOnly,
                },
            },
            {
                path: EAppRoutes.CreateUser,
                component: CreateUserComponent,
                data: {
                    accessFor: EUserRoles.Admin,
                    disabledFor: EUsersState.ReadOnly,
                },
            },
            {
                path: EAppRoutes.ProfitSettings,
                component: ProfitSettingsComponent,
                data: {
                    accessFor: EUserRoles.Admin,
                    disabledFor: EUsersState.ReadOnly,
                },
            },
            {
                path: '**',
                component: PageNotFoundComponent,
                data: {
                    accessFor: EUserRoles.User,
                    disabledFor: 'none',
                },
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
