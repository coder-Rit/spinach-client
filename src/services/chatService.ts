import type { LlmChatResponse } from "../types/chat";

export type ChatRole = "USER" | "AI";

export interface ChatSessionDto {
  id: string;
  title: string;
  updatedAt: string;
}

export interface ChatMessageDto {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
}

let API_BASE = (process.env.REACT_APP_API_BASE_URL ?? "").replace(/\/$/, "");

API_BASE = API_BASE + "/api/v1"

const authHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
});

const toErrorMessage = async (res: Response, fallback: string) => {
  try {
    const text = await res.text();
    return `${fallback} (status ${res.status})${text ? `: ${text}` : ""}`;
  } catch {
    return `${fallback} (status ${res.status})`;
  }
};

interface SessionsApiItem {
  id?: string;
  session_id?: string;
  title?: string;
  name?: string;
  updatedAt?: string;
  updated_at?: string;
  created_at?: string;
}

interface SessionsApiResponse {
  hits?: SessionsApiItem[];
}

const normalizeChatSession = (item: SessionsApiItem): ChatSessionDto => ({
  id: String(item.id ?? item.session_id ?? ""),
  title: String(item.title ?? item.name ?? "Untitled chat"),
  updatedAt: String(
    item.updatedAt ?? item.updated_at ?? item.created_at ?? new Date().toISOString()
  ),
});

export const getChatSessions = async (accessToken: string): Promise<ChatSessionDto[]> => {
  const url = `${API_BASE}/chats/sessions`;
  const res = await fetch(url, {
    method: "GET",
    headers: authHeaders(accessToken),
  });

  if (res.status === 404) {
    return [];
  }

  if (!res.ok) {
    throw new Error(await toErrorMessage(res, "Failed to load chat sessions"));
  }

  const data = (await res.json()) as SessionsApiResponse | SessionsApiItem[];
  const hits = Array.isArray(data) ? data : (data.hits ?? []);

  return hits.map(normalizeChatSession);
};

interface ChatsApiItem {
  id?: string;
  chat_id?: string;
  role?: string;
  content?: string;
  message?: string;
  text?: string;
  createdAt?: string;
  created_at?: string;
}

interface ChatsApiResponse {
  hits?: ChatsApiItem[];
}

const normalizeChatMessage = (item: ChatsApiItem): ChatMessageDto => ({
  id: String(item.id ?? item.chat_id ?? ""),
  role: item.role === "AI" ? "AI" : "USER",
  content: String(item.content ?? item.message ?? item.text ?? ""),
  createdAt: String(item.createdAt ?? item.created_at ?? new Date().toISOString()),
});

export const getChatMessages = async (
  accessToken: string,
  sessionId: string
): Promise<ChatMessageDto[]> => {
  const params = new URLSearchParams({
    session_id: sessionId,
    page: "1",
    size: "500",
  });

  const url = `${API_BASE}/chats?${params.toString()}`;
  const res = await fetch(url, {
    method: "GET",
    headers: authHeaders(accessToken),
  });

  if (res.status === 404) {
    return [];
  }

  if (!res.ok) {
    throw new Error(await toErrorMessage(res, "Failed to load chat messages"));
  }

  const data = (await res.json()) as ChatsApiResponse | ChatsApiItem[];
  const hits = Array.isArray(data) ? data : (data.hits ?? []);

  return hits.map(normalizeChatMessage);
};

export const sendLlmMessage = async (
  accessToken: string,
  message: string,
  sessionId?: string,
  projectId?: string,
  onChunk?: (token: string) => void,
): Promise<LlmChatResponse> => {
  const normalizedSessionId = sessionId?.trim();

  if (!normalizedSessionId) {
    throw new Error("No active chat session selected");
  }

  const url = `${API_BASE}/llm`;

  const body: Record<string, unknown> = {
    message,
    session_id: normalizedSessionId,
    ...(projectId ? { project_id: projectId } : {}),
  };

  const res = await fetch(url, {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(await toErrorMessage(res, "Failed to send message"));
  }

  const data = (await res.json()) as {
    session_id?: string;
    response?: string;
    tool_files_used?: string[];
  };

  const responseText = data.response ?? "";
  const responseSessionId = data.session_id ?? normalizedSessionId;

  if (onChunk && responseText) {
    onChunk(responseText);
  }

  return {
    resp: responseText,
    sessionId: responseSessionId,
  };
};


