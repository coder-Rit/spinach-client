import { apiRequest } from "./apiClient";
import { User, UserSearchResponse } from "../types/user";

interface UserApiResponse {
  user_id: string;
  name: string;
  email: string;
}

interface UserSearchApiResponse {
  total: number;
  page: number;
  size: number;
  hits: UserApiResponse[];
}

const toUserModel = (user: UserApiResponse): User => ({
  userId: user.user_id,
  name: user.name,
  email: user.email,
});

export const searchUsers = async (
  token: string,
  options: { search?: string; page?: number; size?: number } = {}
): Promise<UserSearchResponse> => {
  const params = new URLSearchParams();
  if (options.search) params.append("search", options.search);
  params.append("page", String(options.page || 1));
  params.append("size", String(options.size || 20));

  const response = await apiRequest<UserSearchApiResponse>(`/user?${params.toString()}`, {
    method: "GET",
    token,
  });

  return {
    total: response.total,
    page: response.page,
    size: response.size,
    hits: response.hits.map(toUserModel),
  };
};
