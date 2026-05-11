const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || process.env.REACT_APP_BASE_URL || "http://localhost:9000";

const API_V1_PREFIX = "/api/v1";

interface ApiRequestOptions extends RequestInit {
  token?: string;
}

const buildUrl = (path: string): string => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${API_V1_PREFIX}${normalizedPath}`;
};

export const apiRequest = async <T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> => {
  const { token, headers, ...restOptions } = options;

  const response = await fetch(buildUrl(path), {
    ...restOptions,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage =
      (data && (data.detail || data.error || data.message)) || "Request failed";
    throw new Error(errorMessage);
  }

  return data as T;
};
