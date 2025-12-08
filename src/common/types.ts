import { AccountType } from './constants';

export type TParticipantAccountType = AccountType.USER | AccountType.PERFORMER;

export type TSenderAccountType =
    | AccountType.USER
    | AccountType.PERFORMER
    | AccountType.SYSTEM;
