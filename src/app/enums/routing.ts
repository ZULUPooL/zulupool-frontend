export enum EAppRoutes {
    Landing = "landing",
    Home = "",
    Auth = "auth",
    UserResendEmail = "resend-email",
    Actions = "actions",
    Monitoring = "monitoring",
    History = "history",
    Users = "users",
    Help = "help",
    Payouts = "payouts",
    Settings = "settings",
    CreateUser = "create-user",
}

export enum EActionsRoutes {
    UserActivate = "user-acivate",
}

export const userRootRoute = EAppRoutes.Monitoring;
