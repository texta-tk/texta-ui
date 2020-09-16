export class UserAuth {
  key: string;
}

export enum USERROLES {
  USER = 0,
  SUPERUSER = 1,
}


export interface RefreshTokenResp {
  access_token: string;
  token_type: string;
  id_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
  jti: string;
}