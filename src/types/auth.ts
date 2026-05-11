export interface AuthTokens {
  access_token: string;
  token_type: string;
}

export interface AuthUser {
  userId: string;
  email: string;
  name: string;
  accessToken: string;
  tokenType: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}
