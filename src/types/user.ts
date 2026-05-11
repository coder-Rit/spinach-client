export interface User {
  userId: string;
  name: string;
  email: string;
}

export interface UserSearchResponse {
  total: number;
  page: number;
  size: number;
  hits: User[];
}
