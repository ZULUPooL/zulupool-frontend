import { EUserRoles } from 'enums/role';
import { TCoinName } from 'interfaces/coin';

export interface IUser {
    login?: string;
    name: string;
    email: string;
    registrationDate: number;
    workers?: number;
    shareRate?: number;
    power?: number;
    lastShareTime?: number;
    role: EUserRoles;
    users?: IUser[];
}

export interface IUserInfo {
    login: string;
    name: string;
    email: string;
    registrationDate: number;
    workers: number;
    shareRate: number;
    power: number;
    lastShareTime: number;
    role: EUserRoles;
    type?: number;
}

export interface IUserSettings {
    name: TCoinName;
    address: string;
    payoutThreshold: number;
    autoPayoutEnabled: boolean;
}
