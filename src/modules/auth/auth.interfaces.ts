export interface IAccountTokenPayload {
    expiresIn: number;
    expiredAt: string;
}

export interface IAccountToken extends IAccountTokenPayload {
    iat: number;
    exp: number;
}

export interface IGenerateTokenResult {
    token: string;
    expiresIn: number;
    expiredAt: string;
}
