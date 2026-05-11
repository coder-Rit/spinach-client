import { DragEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import { getProjectById } from "../services/projectsService";
import { Project } from "../types/project";
import { createWorkItem, deleteWorkItem, listWorkItems, updateWorkItem } from "../services/workItemsService";
import { WorkItem, WorkItemStatus, WorkItemType } from "../types/workItem";
import { searchUsers } from "../services/usersService";
import { User } from "../types/user";
import { PlusCircle, FolderOpen, FolderLock, ArrowLeft, Tag } from "lucide-react";
import { WorkItemFormData, defaultFormData } from "../types/workItemForm";
import { BOARD_COLUMNS, toProjectKey, toApiDateTime } from "../constants/workItem";
import BoardFilters from "../components/board/BoardFilters";
import BoardColumn from "../components/board/BoardColumn";
import CreateWorkItemModal from "../components/modals/CreateWorkItemModal";
import ViewEditWorkItemModal from "../components/modals/ViewEditWorkItemModal";
import DeleteWorkItemModal from "../components/modals/DeleteWorkItemModal";

const StatusTag = ({ isOpen }: { isOpen: boolean }) => (
  <span
    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${isOpen
        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
        : "bg-neutral-700/50 text-neutral-400 border-neutral-600/50"
      }`}
  >
    {isOpen ? <FolderOpen size={11} /> : <FolderLock size={11} />}
    {isOpen ? "Open" : "Closed"}
  </span>
);

const getAssigneeMeta = (id: string): { name: string; avatar: string } => ({
  name: id ? "Assigned" : "Unassigned",
  avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(id || "U")}&size=28`,
});

const ProjectView = () => {
  const { projectId = "" } = useParams();
  const { user } = useAuthContext();

  const [project, setProject] = useState<Project | null>(null);
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [boardError, setBoardError] = useState<string | null>(null);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null);

  // Filters
  const [boardSearch, setBoardSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<WorkItemStatus | "">("");
  const [typeFilter, setTypeFilter] = useState<WorkItemType | "">("");
  const [assigneeFilter, setAssigneeFilter] = useState("");

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [activeWorkItem, setActiveWorkItem] = useState<WorkItem | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Users
  const [users, setUsers] = useState<User[]>([]);
  const [assigneeSearch, setAssigneeSearch] = useState("");
  const [usersLoading, setUsersLoading] = useState(false);

  // Form
  const [formData, setFormData] = useState<WorkItemFormData>(defaultFormData());
  const onFormChange = (field: keyof WorkItemFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const closeAllModals = () => {
    setIsCreateOpen(false);
    setIsViewOpen(false);
    setIsDeleteOpen(false);
    setIsEditMode(false);
    setActiveWorkItem(null);
    setFormData(defaultFormData());
  };

  const openViewModal = (item: WorkItem) => {
    setActiveWorkItem(item);
    setFormData({
      title: item.title,
      description: item.description ?? "",
      status: item.status,
      itemType: item.itemType,
      assignedTo: item.assignedTo ?? "",
      startDate: item.startDate ? item.startDate.slice(0, 10) : "",
      endDate: item.endDate ? item.endDate.slice(0, 10) : "",
      linkedWorkItemId: item.linkedWorkItemId ?? "",
    });
    setIsViewOpen(true);
  };

  const openDeleteModal = (item: WorkItem) => {
    setActiveWorkItem(item);
    setIsDeleteOpen(true);
  };

  const projectKey = project ? toProjectKey(project.title) : "PRJ";

  const boardByStatus = useMemo(
    () =>
      BOARD_COLUMNS.reduce(
        (acc, status) => ({ ...acc, [status]: workItems.filter((item) => item.status === status) }),
        {} as Record<WorkItemStatus, WorkItem[]>
      ),
    [workItems]
  );

  useEffect(() => {
    const loadProject = async () => {
      if (!user || !projectId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await getProjectById(user.accessToken, projectId);
        setProject(res);
      } catch {
        setError("Unable to load project");
      } finally {
        setLoading(false);
      }
    };
    void loadProject();
  }, [projectId, user]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(boardSearch.trim()), 350);
    return () => window.clearTimeout(timer);
  }, [boardSearch]);

  useEffect(() => {
    const loadWorkItems = async () => {
      if (!user || !projectId) return;
      setItemsLoading(true);
      setBoardError(null);
      try {
        const res = await listWorkItems(user.accessToken, {
          projectId,
          size: 300,
          search: debouncedSearch || undefined,
          status: statusFilter || undefined,
          itemType: typeFilter || undefined,
          assignedTo: assigneeFilter || undefined,
        });
        setWorkItems(res.hits);
      } catch {
        setBoardError("Unable to load work items");
        setWorkItems([]);
      } finally {
        setItemsLoading(false);
      }
    };
    void loadWorkItems();
  }, [projectId, user, debouncedSearch, statusFilter, typeFilter, assigneeFilter]);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        const res = await searchUsers(user.accessToken, { size: 200 });
        setUsers(res.hits);
      } catch {
        setUsers([]);
      }
    };
    void load();
  }, [user]);

  useEffect(() => {
    const load = async () => {
      if (!user || !(isCreateOpen || isEditMode)) return;
      setUsersLoading(true);
      try {
        const res = await searchUsers(user.accessToken, {
          search: assigneeSearch || undefined,
          size: 50,
        });
        setUsers(res.hits);
      } catch {
        setUsers([]);
      } finally {
        setUsersLoading(false);
      }
    };
    void load();
  }, [assigneeSearch, isCreateOpen, isEditMode, user]);

  const handleCreateWorkItem = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || !projectId) return;
    try {
      const created = await createWorkItem(user.accessToken, projectId, {
        itemType: formData.itemType,
        title: formData.title,
        description: formData.description,
        status: formData.status,
        assignedTo: formData.assignedTo,
        startDate: toApiDateTime(formData.startDate),
        endDate: toApiDateTime(formData.endDate),
        linkedWorkItemId: formData.linkedWorkItemId || undefined,
      });
      setWorkItems((items) => [created, ...items]);
      setBoardError(null);
      closeAllModals();
    } catch (err) {
      setBoardError(err instanceof Error ? err.message : "Unable to create work item");
    }
  };

  const handleUpdateWorkItem = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || !activeWorkItem) return;
    try {
      const updated = await updateWorkItem(user.accessToken, activeWorkItem.workItemId, {
        itemType: formData.itemType,
        title: formData.title,
        description: formData.description,
        status: formData.status,
        assignedTo: formData.assignedTo,
        startDate: toApiDateTime(formData.startDate),
        endDate: toApiDateTime(formData.endDate),
        linkedWorkItemId: formData.linkedWorkItemId || undefined,
      });
      setWorkItems((items) =>
        items.map((item) => (item.workItemId === updated.workItemId ? updated : item))
      );
      setBoardError(null);
      setActiveWorkItem(updated);
      setIsEditMode(false);
    } catch (err) {
      setBoardError(err instanceof Error ? err.message : "Unable to update work item");
    }
  };

  const handleDeleteWorkItem = async () => {
    if (!user || !activeWorkItem) return;
    try {
      await deleteWorkItem(user.accessToken, activeWorkItem.workItemId);
      setWorkItems((items) =>
        items.filter((item) => item.workItemId !== activeWorkItem.workItemId)
      );
      setBoardError(null);
      closeAllModals();
    } catch (err) {
      setBoardError(err instanceof Error ? err.message : "Unable to delete work item");
    }
  };

  const onDragStart = (event: DragEvent<HTMLElement>, itemId: string) => {
    setDraggedItemId(itemId);
    event.dataTransfer.effectAllowed = "move";
  };

  const onDrop = async (event: DragEvent<HTMLDivElement>, nextStatus: WorkItemStatus) => {
    event.preventDefault();
    if (!user || !draggedItemId) return;

    const previousItem = workItems.find((item) => item.workItemId === draggedItemId);
    if (!previousItem || previousItem.status === nextStatus) {
      setDraggedItemId(null);
      return;
    }

    setWorkItems((items) =>
      items.map((item) =>
        item.workItemId === draggedItemId ? { ...item, status: nextStatus } : item
      )
    );

    try {
      const updated = await updateWorkItem(user.accessToken, draggedItemId, { status: nextStatus });
      setWorkItems((items) =>
        items.map((item) => (item.workItemId === updated.workItemId ? updated : item))
      );
      setBoardError(null);
    } catch (err) {
      setWorkItems((items) =>
        items.map((item) =>
          item.workItemId === previousItem.workItemId
            ? { ...item, status: previousItem.status }
            : item
        )
      );
      setBoardError(err instanceof Error ? err.message : "Unable to move work item");
    } finally {
      setDraggedItemId(null);
    }
  };

  if (loading) {
    return (
      <div className="w-full px-6 py-20 flex items-center justify-center">
        <div className="text-neutral-400 animate-pulse">Loading project…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full px-6 py-20">
        <p className="bg-neutral-900 rounded-xl p-5 text-neutral-200 border border-neutral-700">
          {error}
        </p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="w-full px-6 py-20 text-neutral-400">Project not found.</div>
    );
  }

  const isOpen = project.status === "OPEN";
  const displayKey = activeWorkItem
    ? `${projectKey}-${activeWorkItem.displayId}`
    : "";

  return (
    <div className="w-full px-6 lg:px-10 py-8" onClick={() => setMenuOpenFor(null)}>
      {/* Breadcrumb */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-white transition-colors duration-200"
      >
        <ArrowLeft size={14} />
        Back to Projects
      </Link>

      {/* Project Header */}
      <div className="mt-5 bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div
              className={`shrink-0 p-2.5 rounded-xl mt-0.5 ${isOpen ? "bg-emerald-500/10" : "bg-neutral-800"
                }`}
            >
              {isOpen ? (
                <FolderOpen size={20} className="text-emerald-400" />
              ) : (
                <FolderLock size={20} className="text-neutral-500" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-semibold text-white">{project.title}</h1>
                <StatusTag isOpen={isOpen} />
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono text-neutral-500 bg-neutral-800 border border-neutral-700">
                  <Tag size={9} />
                  {projectKey}
                </span>
              </div>
              
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setIsCreateOpen(true); }}
            className="shrink-0 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-medium text-sm shadow-sm shadow-emerald-950/30 transition-colors duration-200"
          >
            <PlusCircle size={15} />
            Add Work Item
          </button>
        </div>
      </div>

      {/* Board Section */}
      <div className="mt-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white">Board</h2>
        </div>

        <BoardFilters
          search={boardSearch}
          statusFilter={statusFilter}
          typeFilter={typeFilter}
          assigneeFilter={assigneeFilter}
          users={users}
          loading={itemsLoading}
          onSearchChange={setBoardSearch}
          onStatusChange={setStatusFilter}
          onTypeChange={setTypeFilter}
          onAssigneeChange={setAssigneeFilter}
        />

        {boardError && (
          <p className="bg-neutral-900 rounded-xl p-3 text-red-400 border border-red-900/40 text-sm mt-4">
            {boardError}
          </p>
        )}

        <div className="flex gap-5 overflow-x-auto pb-4 mt-5 min-h-[calc(100vh-320px)]">
          {BOARD_COLUMNS.map((columnStatus) => (
            <BoardColumn
              key={columnStatus}
              status={columnStatus}
              items={boardByStatus[columnStatus]}
              projectKey={projectKey}
              menuOpenFor={menuOpenFor}
              getAssigneeMeta={getAssigneeMeta}
              onView={openViewModal}
              onDelete={openDeleteModal}
              onDragStart={onDragStart}
              onDrop={onDrop}
              onMenuToggle={setMenuOpenFor}
            />
          ))}
        </div>
      </div>

      {/* Overlay */}
      {(isCreateOpen || isViewOpen || isDeleteOpen) && (
        <div
          onClick={closeAllModals}
          className="fixed inset-0 bg-neutral-950/70 backdrop-blur-sm z-40"
        />
      )}

      {/* Create Modal */}
      {isCreateOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] max-w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto bg-neutral-800 border border-neutral-700 rounded-xl p-6"
        >
          <CreateWorkItemModal
            formData={formData}
            users={users}
            usersLoading={usersLoading}
            workItems={workItems}
            projectKey={projectKey}
            onFormChange={onFormChange}
            onAssigneeSearch={setAssigneeSearch}
            onSubmit={handleCreateWorkItem}
            onClose={closeAllModals}
          />
        </div>
      )}

      {/* View/Edit Modal */}
      {isViewOpen && activeWorkItem && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[56rem] max-w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto bg-neutral-800 border border-neutral-700 rounded-xl p-6"
        >
          <ViewEditWorkItemModal
            item={activeWorkItem}
            displayKey={displayKey}
            isEditMode={isEditMode}
            formData={formData}
            users={users}
            usersLoading={usersLoading}
            workItems={workItems}
            projectKey={projectKey}
            getAssigneeMeta={getAssigneeMeta}
            onFormChange={onFormChange}
            onAssigneeSearch={setAssigneeSearch}
            onToggleEdit={() => setIsEditMode((v) => !v)}
            onSave={handleUpdateWorkItem}
            onClose={closeAllModals}
          />
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteOpen && activeWorkItem && (
        <DeleteWorkItemModal
          item={activeWorkItem}
          displayKey={displayKey}
          onConfirm={handleDeleteWorkItem}
          onClose={closeAllModals}
        />
      )}
    </div>
  );
};

export default ProjectView;
