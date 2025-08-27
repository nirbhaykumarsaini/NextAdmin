export interface ILogin {
  username: string;
  password: string;
}

export interface IRegister {
  username: string;
  password: string;
  role?: 'user' | 'admin';
}


export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}