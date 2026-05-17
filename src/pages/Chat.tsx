import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2, MessageSquare, Plus, Send, Folder, FolderOpen, FolderLock, ChevronDown, X } from "lucide-react";
import SpinachLogo from "../components/SpinachLogo";
import { useAuthContext } from "../hooks/useAuthContext";
import {
  getChatMessages,
  getChatSessions,
  sendLlmMessage,
  type ChatMessageDto,
  type ChatSessionDto,
} from "../services/chatService";
import { listProjects } from "../services/projectsService";
import { Project } from "../types/project";
import ReactMarkdown from "react-markdown";

const SESSION_STORAGE_KEY = "spinach_llm_session_id";

type ChatRole = "USER" | "AI";

interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
}

const getStoredSessionId = (): string => {
  try {
    return sessionStorage.getItem(SESSION_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
};

const sendBtnClass =
  "shrink-0 h-[52px] w-[52px] flex items-center justify-center rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 duration-300 disabled:opacity-40 disabled:pointer-events-none shadow-sm shadow-emerald-950/30";

const mapApiMessage = (m: ChatMessageDto): ChatMessage => ({
  id: m.id ?? crypto.randomUUID(),
  role: m.role,
  content: m.content,
});

const Chat = () => {
  const { user } = useAuthContext();
  const [sessionId, setSessionId] = useState(getStoredSessionId);
  const [sessions, setSessions] = useState<ChatSessionDto[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const projectDropdownRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (projectDropdownRef.current && !projectDropdownRef.current.contains(e.target as Node)) {
        setProjectDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  const persistSessionId = (id: string) => {
    setSessionId(id);
    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, id);
    } catch {
      // ignore
    }
  };

  const refreshSessions = useCallback(async () => {
    if (!user?.accessToken) return;
    setLoadingSessions(true);
    try {
      const data = await getChatSessions(user.accessToken);
      setSessions(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load sessions";
      setError(message);
    } finally {
      setLoadingSessions(false);
    }
  }, [user?.accessToken]);

  useEffect(() => {
    if (!user?.accessToken) return;

    if (!sessionId) {
      persistSessionId(crypto.randomUUID());
    }

    void refreshSessions();

    listProjects(user.accessToken, { size: 200 })
      .then((res) => setProjects(res.hits))
      .catch(() => { });
  }, [user?.accessToken]); // initialize once per login/token change

  useEffect(() => {
    const loadMessages = async () => {
      if (!user?.accessToken || !sessionId) return;
      setLoadingMessages(true);
      try {
        const data = await getChatMessages(user.accessToken, sessionId);
        setMessages(data.map(mapApiMessage));
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load messages";
        setError(message);
        setMessages([]);
      } finally {
        setLoadingMessages(false);
      }
    };

    void loadMessages();
  }, [user?.accessToken, sessionId]);

  const sendCurrentMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    if (!user?.accessToken) {
      setError("You need to be signed in to send messages.");
      return;
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "USER",
      content: trimmed,
    };

    const aiMessageId = crypto.randomUUID();

    setMessages((prev) => [
      ...prev,
      userMessage,
      { id: aiMessageId, role: "AI", content: "" },
    ]);
    setInput("");
    setError(null);
    setLoading(true);
    setIsStreaming(false);

    try {
      const data = await sendLlmMessage(
        user.accessToken,
        trimmed,
        sessionId,
        selectedProjectId || undefined,
        (token) => {
          setIsStreaming(true);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiMessageId ? { ...m, content: m.content + token } : m
            )
          );
        },
      );

      if (data.sessionId && data.sessionId !== sessionId) {
        persistSessionId(data.sessionId);
      }

      // Ensure AI message bubble shows the final response (in case onChunk was not called)
      if (data.resp) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMessageId && !m.content ? { ...m, content: data.resp } : m
          )
        );
      }

      await refreshSessions();
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== aiMessageId));
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
      setIsStreaming(false);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    void sendCurrentMessage();
  };

  const emptyState = messages.length === 0 && !loading && !loadingMessages;
  const activeTitle = useMemo(
    () => sessions.find((s) => s.id === sessionId)?.title ?? "New chat",
    [sessions, sessionId]
  );

  const handleNewSession = () => {
    if (messages.length === 0 && !loading && !loadingMessages) return;
    const newId = crypto.randomUUID();
    const localSession: ChatSessionDto = {
      id: newId,
      title: "New chat",
      updatedAt: new Date().toISOString(),
    };
    setSessions((prev) => [localSession, ...prev]);
    persistSessionId(newId);
    setMessages([]);
    setError(null);
  };

  return (
    <div className="chat-page w-full h-[calc(90vh-5rem)] px-4 md:px-6 lg:px-8 mt-4">
      <div className="max-w-7xl mx-auto h-full">
        <div className="grid grid-cols-1 lg:grid-cols-[18rem_1fr] gap-4 h-full">
          {/* Left sessions - boxed */}
          <aside className="h-full rounded-2xl border border-neutral-800 bg-neutral-950/70 p-3 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm text-neutral-300 font-medium">Chat Sessions</h2>
              <button
                type="button"
                onClick={() => handleNewSession()}
                className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300"
              >
                <Plus size={14} />
                New
              </button>
            </div>

            <div className="space-y-1 flex-1 overflow-y-auto pr-1">
              {loadingSessions && (
                <div className="text-xs text-neutral-500 px-2 py-2">Loading sessions…</div>
              )}

              {!loadingSessions && sessions.length === 0 && (
                <div className="text-xs text-neutral-500 px-2 py-2">No sessions yet.</div>
              )}

              {sessions.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => persistSessionId(s.id)}
                  className={`w-full text-left rounded-lg px-2 py-2 text-sm border transition ${s.id === sessionId
                    ? "border-emerald-600/60 bg-emerald-950/20 text-emerald-300"
                    : "border-transparent hover:border-neutral-700 text-neutral-300 hover:bg-neutral-900/60"
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare size={14} />
                    <span className="truncate">{s.title || "Untitled session"}</span>
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-1">
                    {new Date(s.updatedAt).toLocaleString()}
                  </div>
                </button>
              ))}
            </div>
          </aside>

          {/* Main chat - boxed */}
          <div className="h-full min-h-0 rounded-2xl border border-neutral-800 bg-neutral-950/40 p-4">
            <div className="h-full max-w-3xl mx-auto flex flex-col min-h-0">
              {/* Chat panel header */}
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="text-sm text-neutral-400">
                  {!emptyState && (
                    <><span className="text-neutral-300">Session:</span> {activeTitle}</>
                  )}
                </span>

                {/* Custom project dropdown */}
                <div ref={projectDropdownRef} className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => setProjectDropdownOpen((v) => !v)}
                    className="flex items-center gap-2 bg-neutral-900 border border-neutral-700 hover:border-neutral-600 rounded-lg px-3 py-1.5 text-xs text-neutral-300 duration-150 max-w-[220px]"
                  >
                    {selectedProjectId ? (
                      <>
                        {projects.find((p) => p.projectId === selectedProjectId)?.status === "OPEN"
                          ? <FolderOpen size={13} className="text-emerald-400 shrink-0" />
                          : <FolderLock size={13} className="text-neutral-500 shrink-0" />}
                        <span className="truncate">
                          {projects.find((p) => p.projectId === selectedProjectId)?.title ?? "Project"}
                        </span>
                        <span
                          className={`shrink-0 px-1.5 py-0.5 rounded-full text-[10px] border leading-none ${projects.find((p) => p.projectId === selectedProjectId)?.status === "OPEN"
                            ? "bg-emerald-950/60 border-emerald-700/50 text-emerald-300"
                            : "bg-neutral-800 border-neutral-600 text-neutral-400"
                            }`}
                        >
                          {projects.find((p) => p.projectId === selectedProjectId)?.status === "OPEN" ? "Open" : "Closed"}
                        </span>
                      </>
                    ) : (
                      <>
                        <Folder size={13} className="text-neutral-500 shrink-0" />
                        <span className="text-neutral-500">No project</span>
                      </>
                    )}
                    <ChevronDown size={12} className={`ml-auto shrink-0 text-neutral-500 duration-150 ${projectDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {projectDropdownOpen && (
                    <div className="absolute right-0 top-full mt-1.5 w-64 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl shadow-black/40 z-50 overflow-hidden">
                      <div className="p-1.5 max-h-72 overflow-y-auto">
                        {/* Clear option */}
                        <button
                          type="button"
                          onClick={() => { setSelectedProjectId(""); setProjectDropdownOpen(false); }}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs duration-100 ${!selectedProjectId
                            ? "bg-emerald-950/40 text-emerald-300"
                            : "text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
                            }`}
                        >
                          <X size={12} className="shrink-0" />
                          No project
                        </button>

                        {projects.length > 0 && (
                          <div className="my-1 border-t border-neutral-800" />
                        )}

                        {projects.map((p) => {
                          const isOpen = p.status === "OPEN";
                          const isSelected = selectedProjectId === p.projectId;
                          return (
                            <button
                              key={p.projectId}
                              type="button"
                              onClick={() => { setSelectedProjectId(p.projectId); setProjectDropdownOpen(false); }}
                              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs duration-100 ${isSelected
                                ? "bg-emerald-950/40 text-emerald-300"
                                : "text-neutral-300 hover:bg-neutral-800"
                                }`}
                            >
                              {isOpen
                                ? <FolderOpen size={13} className="text-emerald-400 shrink-0" />
                                : <FolderLock size={13} className="text-neutral-500 shrink-0" />}
                              <span className="truncate flex-1 text-left">{p.title}</span>
                              <span className={`shrink-0 px-1.5 py-0.5 rounded-full text-[10px] border leading-none ${isOpen
                                ? "bg-emerald-950/60 border-emerald-700/50 text-emerald-300"
                                : "bg-neutral-800 border-neutral-600 text-neutral-400"
                                }`}>
                                {isOpen ? "Open" : "Closed"}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {emptyState ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center gap-8 py-6">
                  <div className="flex flex-col items-center gap-4">
                    <SpinachLogo size={56} withFrame className="shadow-lg shadow-black/30" />
                    <div>
                      <h1 className="text-3xl font-medium text-white flex items-center justify-center gap-2">
                        Spina
                      </h1>
                      <p className="mt-2 text-neutral-400 text-sm max-w-md mx-auto">
                        Spina is your Spinach assistant: short, clear answers grounded in your workspace
                        context, friendly for quick questions, and tuned for simple explanations.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto px-1 py-4 space-y-6 min-h-0">
                  {messages.filter((msg) => !(msg.role === "AI" && !msg.content && loading)).map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex w-full gap-2.5 ${msg.role === "USER" ? "justify-end" : "justify-start"}`}
                    >
                      {msg.role === "AI" && (
                        <SpinachLogo size={28} withFrame alt="" className="mt-1" />
                      )}
                      <div
                        className={`max-w-[min(100%,36rem)] rounded-2xl px-4 py-3 text-[15px] leading-relaxed ${msg.role === "USER"
                          ? "bg-neutral-800 text-neutral-100 border border-neutral-600"
                          : "bg-neutral-900/80 text-neutral-200 border border-neutral-700"
                          }`}
                      >
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    </div>
                  ))}

                  {(loadingMessages || (loading && !isStreaming)) && (
                    <div className="flex justify-start gap-2.5">
                      <SpinachLogo size={28} withFrame alt="" className="mt-1" />
                      <div className="inline-flex items-center gap-2 rounded-2xl border border-neutral-700 bg-neutral-900/80 px-4 py-3 text-neutral-400 text-sm">
                        <Loader2 className="animate-spin" size={18} aria-hidden />
                        <span>Spina is thinking…</span>
                      </div>
                    </div>
                  )}

                  <div ref={bottomRef} />
                </div>
              )}

              {error && (
                <div className="px-1 pb-2">
                  <p className="text-sm text-red-400 bg-neutral-950/60 border border-red-900/50 rounded-xl px-4 py-3">
                    {error}
                  </p>
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                className="mt-auto pt-4 border-t border-neutral-700 bg-neutral-950/40"
              >
                <div className="flex gap-3 items-end">
                  <label htmlFor="chat-input" className="sr-only">
                    Message
                  </label>
                  <textarea
                    id="chat-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        void sendCurrentMessage();
                      }
                    }}
                    placeholder="Message Spina…"
                    rows={1}
                    disabled={loading}
                    className="flex-1 resize-none bg-neutral-950 border border-neutral-600 rounded-xl px-4 py-3 text-neutral-100 placeholder:text-neutral-500 outline-none focus:border-emerald-500/70 focus:ring-1 focus:ring-emerald-500/25 duration-300 min-h-[52px] max-h-40 disabled:opacity-60"
                  />
                  <button type="submit" disabled={loading || !input.trim()} className={sendBtnClass} aria-label="Send message">
                    <Send size={20} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
