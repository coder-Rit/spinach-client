import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import {
    PlusCircle,
    Search,
    Folder,
    Calendar,
    User,
    ChevronRight,
    X,
    FolderOpen,
    FolderLock,
} from "lucide-react";
import { useAuthContext } from "../hooks/useAuthContext";
import { createProject, listProjects } from "../services/projectsService";
import { Project } from "../types/project";
import { searchUsers } from "../services/usersService";
import { User as UserType } from "../types/user";
import SearchSelect from "../components/ui/SearchSelect";
import ReadMoreText from "../components/ui/ReadMoreText";

const inputCls =
    "bg-neutral-900/70 border border-neutral-700 px-3 py-2.5 rounded-lg outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20 text-sm w-full duration-200";

const Projects = () => {
    const { user } = useAuthContext();
    const navigate = useNavigate();

    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"" | "OPEN" | "CLOSE">("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [formTitle, setFormTitle] = useState("");
    const [formDescription, setFormDescription] = useState("");
    const [formStatus, setFormStatus] = useState<"OPEN" | "CLOSE">("OPEN");
    const [formManager, setFormManager] = useState("");
    const [managerSearch, setManagerSearch] = useState("");
    const [users, setUsers] = useState<UserType[]>([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        const t = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
        return () => window.clearTimeout(t);
    }, [search]);

    useEffect(() => {
        if (!user) return;
        setLoading(true);
        setError(null);
        listProjects(user.accessToken, {
            search: debouncedSearch || undefined,
            status: statusFilter || undefined,
            size: 100,
        })
            .then((res) => setProjects(res.hits))
            .catch(() => setError("Unable to load projects"))
            .finally(() => setLoading(false));
    }, [user, debouncedSearch, statusFilter]);

    useEffect(() => {
        if (!user || !isCreateOpen) return;
        setUsersLoading(true);
        searchUsers(user.accessToken, { search: managerSearch || undefined, size: 50 })
            .then((res) => setUsers(res.hits))
            .catch(() => setUsers([]))
            .finally(() => setUsersLoading(false));
    }, [user, isCreateOpen, managerSearch]);

    const managerOptions = useMemo(
        () => users.map((u) => ({ value: u.userId, label: `${u.name} (${u.email})` })),
        [users]
    );

    const openCreate = () => {
        setFormTitle("");
        setFormDescription("");
        setFormStatus("OPEN");
        setFormManager(user?.userId || "");
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
            setCreateError(err instanceof Error ? err.message : "Unable to create project");
        } finally {
            setCreating(false);
        }
    };

    const filteredProjects = useMemo(() => projects, [projects]);

    const openCount = projects.filter((p) => p.status === "OPEN").length;
    const closedCount = projects.filter((p) => p.status === "CLOSE").length;

    return (
        <div className="w-full px-6 lg:px-10 py-10 max-w-[1400px] mx-auto">
            {/* Page Header */}
            <div className="flex items-start justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-semibold text-white tracking-tight">Projects</h1>
                    <p className="text-neutral-400 text-sm mt-1.5">
                        {projects.length > 0
                            ? `${projects.length} project${projects.length !== 1 ? "s" : ""} · ${openCount} open · ${closedCount} closed`
                            : "Manage and track your team's projects"}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={openCreate}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-lg hover:bg-emerald-500 duration-200 font-medium text-sm shadow-sm shadow-emerald-950/30 shrink-0"
                >
                    <PlusCircle size={15} />
                    New Project
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search projects…"
                        className="w-full bg-neutral-900/60 border border-neutral-700 py-2.5 pl-9 pr-3 rounded-lg outline-none focus:border-emerald-500/60 text-sm duration-200"
                    />
                </div>

                <div className="flex items-center gap-2">
                    {(["", "OPEN", "CLOSE"] as const).map((s) => (
                        <button
                            key={s}
                            type="button"
                            onClick={() => setStatusFilter(s)}
                            className={`px-3 py-2 rounded-lg text-sm border duration-150 ${statusFilter === s
                                ? "bg-emerald-600/20 border-emerald-600/40 text-emerald-300"
                                : "bg-neutral-900/40 border-neutral-700 text-neutral-400 hover:text-neutral-200 hover:border-neutral-600"
                                }`}
                        >
                            {s === "" ? "All" : s === "OPEN" ? "Open" : "Closed"}
                        </button>
                    ))}
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-950/20 border border-red-800/40 rounded-lg px-4 py-3 text-sm text-red-300 mb-6">
                    {error}
                </div>
            )}

            {/* Loading skeleton */}
            {loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-48 bg-neutral-800/40 border border-neutral-700/60 rounded-xl animate-pulse"
                        />
                    ))}
                </div>
            )}

            {/* Projects Grid */}
            {!loading && filteredProjects.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProjects.map((project) => (
                        <ProjectCard
                            key={project.projectId}
                            project={project}
                            onClick={() => navigate(`/projects/${project.projectId}`)}
                        />
                    ))}
                </div>
            )}

            {/* Empty state */}
            {!loading && filteredProjects.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center mb-4">
                        <Folder size={28} className="text-neutral-500" />
                    </div>
                    <h3 className="text-lg font-medium text-neutral-300 mb-2">No projects found</h3>
                    <p className="text-neutral-500 text-sm max-w-xs">
                        {search || statusFilter
                            ? "Try adjusting your search or filters."
                            : "Create your first project to get started."}
                    </p>
                    {!search && !statusFilter && (
                        <button
                            type="button"
                            onClick={openCreate}
                            className="mt-5 flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-500 duration-200 text-sm font-medium"
                        >
                            <PlusCircle size={15} />
                            New Project
                        </button>
                    )}
                </div>
            )}

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

                        <div className="grid grid-cols-2 gap-3">
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
                                            className={`flex-1 py-2.5 rounded-lg border text-sm font-medium duration-150 ${formStatus === s
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
                        </div>

                        <div>
                            <label className="text-xs uppercase tracking-wide text-neutral-400 mb-1.5 block">
                                Project Manager
                            </label>
                            <SearchSelect
                                value={formManager}
                                options={managerOptions}
                                onValueChange={setFormManager}
                                onSearchChange={setManagerSearch}
                                loading={usersLoading}
                                placeholder="Select manager"
                                searchPlaceholder="Search users…"
                                emptyText="No users found"
                            />
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

// Project Card sub-component
interface ProjectCardProps {
    project: Project;
    onClick: () => void;
}

const ProjectCard = ({ project, onClick }: ProjectCardProps) => {
    const isOpen = project.status === "OPEN";

    return (
        <button
            type="button"
            onClick={onClick}
            className="group text-left p-5 bg-neutral-900/40 border border-neutral-700/80 rounded-xl hover:bg-neutral-800/60 hover:border-neutral-600 duration-200 transition-all flex flex-col gap-3"
        >
            {/* Top row */}
            <div className="flex items-start justify-between gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-600/10 border border-emerald-600/20 flex items-center justify-center shrink-0 group-hover:bg-emerald-600/20 duration-200">
                    {isOpen ? (
                        <FolderOpen size={17} className="text-emerald-400" />
                    ) : (
                        <FolderLock size={17} className="text-neutral-500" />
                    )}
                </div>

                <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs border leading-none ${isOpen
                        ? "bg-emerald-950/50 border-emerald-700/60 text-emerald-300"
                        : "bg-neutral-800 border-neutral-600 text-neutral-400"
                        }`}
                >
                    {isOpen ? "Open" : "Closed"}
                </span>
            </div>

            {/* Title */}
            <div>
                <h3 className="font-semibold text-neutral-100 text-base leading-snug group-hover:text-white duration-150 line-clamp-2">
                    {project.title}
                </h3>

                {project.description && (
                    <p className="text-sm text-neutral-500 mt-1.5 line-clamp-2 leading-relaxed">
                        {project.description}
                    </p>
                )}
            </div>

            {/* Footer meta */}
            <div className="mt-auto pt-2 border-t border-neutral-700/50 flex items-center justify-between gap-2 text-xs text-neutral-500">
                <div className="flex items-center gap-1.5 min-w-0">
                    <Calendar size={11} className="shrink-0" />
                    <span className="truncate">{moment(project.createdAt).format("MMM DD, YYYY")}</span>
                </div>
                <div className="flex items-center gap-1.5 text-neutral-400 group-hover:text-emerald-400 duration-150 shrink-0">
                    <span>Open board</span>
                    <ChevronRight size={13} />
                </div>
            </div>
        </button>
    );
};
