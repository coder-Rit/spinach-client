import { apiRequest } from "./apiClient";
import { AuthTokens, AuthUser, LoginRequest, SignupRequest } from "../types/auth";

interface RegisterResponse {
  user_id: string;
  name: string;
  email: string;
}

interface MeResponse {
  user_id: string;
  name: string;
  email: string;
}

const getMe = async (token: string): Promise<MeResponse> => {
  return apiRequest<MeResponse>("/auth/me", {
    method: "GET",
    token,
  });
};

export const loginUser = async (payload: LoginRequest): Promise<AuthUser> => {
  const tokenResponse = await apiRequest<AuthTokens>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const me = await getMe(tokenResponse.access_token);

  return {
    userId: me.user_id,
    email: me.email,
    name: me.name,
    accessToken: tokenResponse.access_token,
    tokenType: tokenResponse.token_type,
  };
};

export const signupUser = async (payload: SignupRequest): Promise<AuthUser> => {
  await apiRequest<RegisterResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const tokenResponse = await apiRequest<AuthTokens>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: payload.email, password: payload.password }),
  });

  const me = await getMe(tokenResponse.access_token);

  return {
    userId: me.user_id,
    email: me.email,
    name: me.name,
    accessToken: tokenResponse.access_token,
    tokenType: tokenResponse.token_type,
  };
};
