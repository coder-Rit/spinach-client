import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DemoUserLoginButton from "../components/DemoUserLoginButton";
import SpinachLogo from "../components/SpinachLogo";
import {
  GITHUB_CLIENT_URL,
  GITHUB_SERVER_URL,
  LIVE_APP_URL,
  SITE_NAME,
} from "../config/site";
import {
  PlusCircle,
  Search,
  FolderOpen,
  FolderLock,
  Calendar,
  Users,
  ChevronRight,
  LayoutGrid,
  List,
  X,
  Code2,
  ExternalLink,
} from "lucide-react";
import { useAuthContext } from "../hooks/useAuthContext";
import { createProject, listProjects } from "../services/projectsService";
import { Project } from "../types/project";

const StatusTag = ({ isOpen }: { isOpen: boolean }) => (
  <span
    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${
      isOpen
        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
        : "bg-neutral-700/50 text-neutral-400 border-neutral-600/50"
    }`}
  >
    {isOpen ? <FolderOpen size={10} /> : <FolderLock size={10} />}
    {isOpen ? "Open" : "Closed"}
  </span>
);

const ReadMore = ({
  text,
  maxLength = 120,
}: {
  text: string;
  maxLength?: number;
}) => {
  const [expanded, setExpanded] = useState(false);
  if (!text)
    return (
      <span className="text-neutral-500 italic text-sm">No description</span>
    );
  if (text.length <= maxLength)
    return <span className="text-neutral-400 text-sm">{text}</span>;

  return (
    <span className="text-neutral-400 text-sm">
      {expanded ? text : `${text.slice(0, maxLength)}…`}
      <button
        onClick={(e) => {
          e.preventDefault();
          setExpanded((v) => !v);
        }}
        className="ml-1 text-emerald-500 hover:text-emerald-400 text-xs font-medium"
      >
        {expanded ? "less" : "more"}
      </button>
    </span>
  );
};

const ProjectCard = ({ project }: { project: Project }) => {
  const isOpen = project.status === "OPEN";
  return (
    <Link
      to={`/projects/${project.projectId}`}
      className="group flex flex-col bg-neutral-900 border border-neutral-800 rounded-xl p-5 hover:border-neutral-600 hover:bg-neutral-800/60 transition-all duration-200 gap-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={`shrink-0 p-2 rounded-lg ${isOpen ? "bg-emerald-500/10" : "bg-neutral-700/40"}`}
          >
            {isOpen ? (
              <FolderOpen size={16} className="text-emerald-400" />
            ) : (
              <FolderLock size={16} className="text-neutral-500" />
            )}
          </div>
          <h3 className="font-semibold text-white truncate group-hover:text-emerald-300 transition-colors duration-200">
            {project.title}
          </h3>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusTag isOpen={isOpen} />
          <ChevronRight
            size={14}
            className="text-neutral-600 group-hover:text-neutral-400 group-hover:translate-x-0.5 transition-all duration-200"
          />
        </div>
      </div>

      <div className="min-h-[2.5rem]">
        <ReadMore text={project.description ?? ""} maxLength={110} />
      </div>

      <div className="flex items-center gap-4 text-xs text-neutral-500 border-t border-neutral-800 pt-3 mt-auto">
        {project.managedBy && (
          <span className="flex items-center gap-1">
            <Users size={11} />
            Manager assigned
          </span>
        )}
        <span className="ml-auto text-neutral-600 text-xs font-mono">
          {project.projectId.slice(0, 8)}…
        </span>
      </div>
    </Link>
  );
};

const ProjectRow = ({ project }: { project: Project }) => {
  const isOpen = project.status === "OPEN";
  return (
    <Link
      to={`/projects/${project.projectId}`}
      className="group flex items-center gap-4 bg-neutral-900 border border-neutral-800 rounded-xl px-5 py-4 hover:border-neutral-600 hover:bg-neutral-800/60 transition-all duration-200"
    >
      <div
        className={`shrink-0 p-2 rounded-lg ${isOpen ? "bg-emerald-500/10" : "bg-neutral-700/40"}`}
      >
        {isOpen ? (
          <FolderOpen size={15} className="text-emerald-400" />
        ) : (
          <FolderLock size={15} className="text-neutral-500" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <span className="font-semibold text-white group-hover:text-emerald-300 transition-colors duration-200 truncate block">
          {project.title}
        </span>
        <ReadMore text={project.description ?? ""} maxLength={80} />
      </div>
      <div className="shrink-0 flex items-center gap-3">
        <StatusTag isOpen={isOpen} />
        <ChevronRight
          size={14}
          className="text-neutral-600 group-hover:text-neutral-400 group-hover:translate-x-0.5 transition-all duration-200"
        />
      </div>
    </Link>
  );
};

const inputCls =
  "bg-neutral-900/70 border border-neutral-700 px-3 py-2.5 rounded-lg outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20 text-sm w-full duration-200";

type ViewMode = "grid" | "list";

const Home = () => {
  const { user } = useAuthContext();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "OPEN" | "CLOSE">(
    "OPEN",
  );
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formStatus, setFormStatus] = useState<"OPEN" | "CLOSE">("OPEN");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const openCreate = () => {
    setFormTitle("");
    setFormDescription("");
    setFormStatus("OPEN");
    setCreateError(null);
    setIsCreateOpen(true);
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setCreating(true);
    setCreateError(null);
    try {
      const created = await createProject(user.accessToken, {
        title: formTitle,
        description: formDescription,
        status: formStatus,
      });
      setProjects((prev) => [created, ...prev]);
      setIsCreateOpen(false);
    } catch (err) {
      setCreateError(
        err instanceof Error ? err.message : "Unable to create project",
      );
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const res = await listProjects(user.accessToken, { size: 200 });
        setProjects(res.hits);
      } catch {
        setError("Unable to load projects");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [user]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return projects.filter((p) => {
      const matchSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q);
      const matchStatus = !statusFilter || p.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [projects, search, statusFilter]);

  const openCount = projects.filter((p) => p.status === "OPEN").length;
  const closedCount = projects.filter((p) => p.status === "CLOSE").length;

  return (
    <div className="w-full max-w-screen-xl mx-auto px-6 lg:px-10 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-white">Projects</h1>
          <p className="mt-1 text-neutral-400 text-sm">
            {loading
              ? "Loading…"
              : `${projects.length} project${projects.length !== 1 ? "s" : ""} — ${openCount} open, ${closedCount} closed`}
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-medium text-sm shadow-sm shadow-emerald-950/30 transition-colors duration-200 w-fit"
        >
          <PlusCircle size={15} />
          New Project
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <p className="text-2xl font-bold text-white">{projects.length}</p>
          <p className="text-xs text-neutral-400 mt-0.5">Total Projects</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <p className="text-2xl font-bold text-emerald-400">{openCount}</p>
          <p className="text-xs text-neutral-400 mt-0.5">Open</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <p className="text-2xl font-bold text-neutral-400">{closedCount}</p>
          <p className="text-xs text-neutral-400 mt-0.5">Closed</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects…"
            className="w-full bg-neutral-900 border border-neutral-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-500 outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20 duration-200"
          />
        </div>
        <div className="flex gap-1 bg-neutral-900 border border-neutral-800 rounded-xl p-1">
          {(["", "OPEN", "CLOSE"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                statusFilter === s
                  ? "bg-emerald-600 text-white"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800"
              }`}
            >
              {s === "" ? "All" : s === "OPEN" ? "Open" : "Closed"}
            </button>
          ))}
        </div>
        {/* <div className="flex gap-1 bg-neutral-900 border border-neutral-800 rounded-xl p-1 ml-auto">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-lg transition-colors duration-150 ${viewMode === "grid" ? "bg-emerald-600 text-white" : "text-neutral-400 hover:text-white"}`}
            title="Grid view"
          >
            <LayoutGrid size={14} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded-lg transition-colors duration-150 ${viewMode === "list" ? "bg-emerald-600 text-white" : "text-neutral-400 hover:text-white"}`}
            title="List view"
          >
            <List size={14} />
          </button>
        </div> */}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-neutral-900 border border-red-900/40 rounded-xl p-4 mb-6 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              : "flex flex-col gap-3"
          }
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 animate-pulse"
            >
              <div className="h-4 bg-neutral-800 rounded w-3/4 mb-3" />
              <div className="h-3 bg-neutral-800 rounded w-full mb-1.5" />
              <div className="h-3 bg-neutral-800 rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl mb-4">
            <FolderOpen size={32} className="text-neutral-600" />
          </div>
          <p className="text-neutral-300 font-medium">No projects found</p>
          <p className="text-neutral-500 text-sm mt-1">
            {search || statusFilter
              ? "Try adjusting your filters"
              : "Create your first project to get started"}
          </p>
          {!search && !statusFilter && (
            <button
              type="button"
              onClick={openCreate}
              className="mt-4 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
            >
              <PlusCircle size={14} />
              New Project
            </button>
          )}
        </div>
      )}

      {/* Projects grid/list */}
      {!loading &&
        filtered.length > 0 &&
        (viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((project) => (
              <ProjectCard key={project.projectId} project={project} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((project) => (
              <ProjectRow key={project.projectId} project={project} />
            ))}
          </div>
        ))}
      {/* Backdrop */}
      {isCreateOpen && (
        <div
          onClick={() => setIsCreateOpen(false)}
          className="fixed inset-0 bg-neutral-950/60 backdrop-blur-sm z-40"
        />
      )}

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[36rem] max-w-[calc(100vw-2rem)] bg-neutral-800 border border-neutral-700 rounded-xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-white">New Project</h3>
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="p-1.5 rounded-lg hover:bg-neutral-700 text-neutral-400"
            >
              <X size={16} />
            </button>
          </div>

          {createError && (
            <p className="bg-red-950/20 border border-red-800/40 rounded-lg px-3 py-2 text-sm text-red-300 mb-4">
              {createError}
            </p>
          )}

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-wide text-neutral-400 mb-1.5 block">
                Title *
              </label>
              <input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Project title"
                required
                className={inputCls}
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-wide text-neutral-400 mb-1.5 block">
                Description
              </label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="What is this project about?"
                className={`${inputCls} min-h-[88px] resize-none`}
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-wide text-neutral-400 mb-1.5 block">
                Status
              </label>
              <div className="flex gap-2">
                {(["OPEN", "CLOSE"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setFormStatus(s)}
                    className={`flex-1 py-2.5 rounded-lg border text-sm font-medium duration-150 ${
                      formStatus === s
                        ? s === "OPEN"
                          ? "bg-emerald-600/20 border-emerald-600/40 text-emerald-300"
                          : "bg-neutral-700 border-neutral-600 text-neutral-200"
                        : "bg-neutral-900/40 border-neutral-700 text-neutral-500 hover:border-neutral-600"
                    }`}
                  >
                    {s === "OPEN" ? "Open" : "Closed"}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="px-4 py-2 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-sm duration-150"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium duration-150 disabled:opacity-60"
              >
                {creating ? "Creating…" : "Create Project"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export const GuestHome = () => (
  <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] px-6 text-center gap-8">
    <div className="flex flex-col items-center gap-4">
      <SpinachLogo size={64} withFrame className="shadow-lg shadow-black/30" />
      <div>
      <h1 className="text-4xl font-semibold text-white">{SITE_NAME}</h1>
      <p className="mt-3 text-neutral-400 max-w-md">
        Project management with AI assistance. Sign in or try the demo account.
      </p>
      </div>
    </div>

    <DemoUserLoginButton showError />

    <div className="flex items-center gap-4 text-sm">
      <Link
        to="/login"
        className="text-emerald-500 hover:text-emerald-400 font-medium"
      >
        Log in
      </Link>
      <span className="text-neutral-600">·</span>
      <Link
        to="/signup"
        className="text-neutral-300 hover:text-white font-medium"
      >
        Sign up
      </Link>
    </div>

    <div className="flex flex-col items-center gap-3 pt-2 border-t border-neutral-800 w-full max-w-sm">
      <p className="text-xs uppercase tracking-wide text-neutral-500">Open source</p>
      <div className="flex flex-col sm:flex-row gap-2 w-full">
        <a
          href={GITHUB_CLIENT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 flex-1 px-4 py-2.5 rounded-xl border border-neutral-700 bg-neutral-900 text-sm text-neutral-200 hover:border-emerald-600/50 hover:bg-neutral-800 duration-200"
        >
          <Code2 size={16} />
          Frontend
        </a>
        <a
          href={GITHUB_SERVER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 flex-1 px-4 py-2.5 rounded-xl border border-neutral-700 bg-neutral-900 text-sm text-neutral-200 hover:border-emerald-600/50 hover:bg-neutral-800 duration-200"
        >
          <Code2 size={16} />
          Backend
        </a>
      </div>
      <a
        href={LIVE_APP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-emerald-400 duration-200"
      >
        <ExternalLink size={12} />
        {LIVE_APP_URL.replace(/^https?:\/\//, "")}
      </a>
    </div>
  </div>
);

export default Home;
