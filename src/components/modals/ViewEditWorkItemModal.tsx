import { FormEvent, useMemo } from "react";
import moment from "moment";
import { Pencil, X } from "lucide-react";
import { WorkItem, WorkItemStatus, WorkItemType } from "../../types/workItem";
import { User } from "../../types/user";
import { WorkItemFormData } from "../../types/workItemForm";
import ThemeSelect from "../ui/ThemeSelect";
import SearchSelect from "../ui/SearchSelect";
import Comments from "../comments/Comments";
import {
    inputClassName,
    primaryBtnSmClass,
    typeChipClass,
    statusChipClass,
    STATUS_LABELS,
    BOARD_COLUMNS,
} from "../../constants/workItem";

interface ViewEditWorkItemModalProps {
    item: WorkItem;
    displayKey: string;
    isEditMode: boolean;
    formData: WorkItemFormData;
    users: User[];
    usersLoading: boolean;
    workItems: WorkItem[];
    projectKey: string;
    getAssigneeMeta: (id: string) => { name: string; avatar: string };
    onFormChange: (field: keyof WorkItemFormData, value: string) => void;
    onAssigneeSearch: (search: string) => void;
    onToggleEdit: () => void;
    onSave: (e: FormEvent<HTMLFormElement>) => void;
    onClose: () => void;
}

const ViewEditWorkItemModal = ({
    item,
    displayKey,
    isEditMode,
    formData,
    users,
    usersLoading,
    workItems,
    projectKey,
    getAssigneeMeta,
    onFormChange,
    onAssigneeSearch,
    onToggleEdit,
    onSave,
    onClose,
}: ViewEditWorkItemModalProps) => {
    const assigneeOptions = useMemo(
        () => users.map((u) => ({ value: u.userId, label: `${u.name} (${u.email})` })),
        [users]
    );

    const statusOptions = useMemo(
        () => BOARD_COLUMNS.map((s) => ({ value: s, label: STATUS_LABELS[s] })),
        []
    );

    const typeOptions = [
        { value: "TASK", label: "Task" },
        { value: "STORY", label: "Story" },
    ];

    const linkedItemOptions = useMemo(
        () => [
            { value: "", label: "No linked item" },
            ...workItems
                .filter((wi) => wi.workItemId !== item.workItemId)
                .map((wi) => ({
                    value: wi.workItemId,
                    label: `${projectKey}-${wi.displayId} — ${wi.title}`,
                })),
        ],
        [workItems, item.workItemId, projectKey]
    );

    const assignee = getAssigneeMeta(item.assignedTo);

    return (
        <>
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-5">
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-neutral-500 font-mono tracking-wider">{displayKey}</span>
                        <span className={typeChipClass[item.itemType]}>{item.itemType}</span>
                        <span className={statusChipClass[item.status]}>{STATUS_LABELS[item.status]}</span>
                    </div>
                    <h3 className="text-xl text-white font-semibold mt-2 leading-tight">
                        {isEditMode ? "Edit Work Item" : item.title}
                    </h3>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    {!isEditMode && (
                        <button
                            type="button"
                            onClick={onToggleEdit}
                            className="p-2 rounded-lg bg-neutral-700/50 hover:bg-neutral-700 border border-neutral-600 text-neutral-400 hover:text-neutral-200 duration-150"
                            title="Edit"
                        >
                            <Pencil size={15} />
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-lg bg-neutral-700/50 hover:bg-neutral-700 border border-neutral-600 text-neutral-400 hover:text-neutral-200 duration-150"
                        title="Close"
                    >
                        <X size={15} />
                    </button>
                </div>
            </div>

            {/* Body */}
            <div className="grid grid-cols-3 gap-6">
                {/* Left: Title + Description */}
                <div className="col-span-2 space-y-4 min-w-0">
                    {isEditMode ? (
                        <form id="ticket-edit-form" onSubmit={onSave} className="space-y-4">
                            <div>
                                <label className="text-xs uppercase tracking-wide text-neutral-400 mb-1.5 block">Title *</label>
                                <input
                                    value={formData.title}
                                    onChange={(e) => onFormChange("title", e.target.value)}
                                    required
                                    className={`${inputClassName} w-full`}
                                />
                            </div>
                            <div>
                                <label className="text-xs uppercase tracking-wide text-neutral-400 mb-1.5 block">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => onFormChange("description", e.target.value)}
                                    className={`${inputClassName} w-full min-h-[140px] resize-none`}
                                />
                            </div>
                        </form>
                    ) : (
                        <div>
                            <p className="text-xs uppercase tracking-wide text-neutral-400 mb-2">Description</p>
                            <div
                                className={`${inputClassName} min-h-[120px] max-h-[260px] overflow-y-auto text-neutral-300 whitespace-pre-wrap text-sm leading-relaxed`}
                            >
                                {item.description || <span className="text-neutral-600 italic">No description provided.</span>}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Meta */}
                <div className="col-span-1 space-y-3 text-sm">
                    {isEditMode ? (
                        <>
                            <div>
                                <label className="text-xs uppercase tracking-wide text-neutral-400 mb-1.5 block">Type</label>
                                <ThemeSelect
                                    value={formData.itemType}
                                    onChange={(v) => onFormChange("itemType", v as WorkItemType)}
                                    options={typeOptions}
                                />
                            </div>
                            <div>
                                <label className="text-xs uppercase tracking-wide text-neutral-400 mb-1.5 block">Status</label>
                                <ThemeSelect
                                    value={formData.status}
                                    onChange={(v) => onFormChange("status", v as WorkItemStatus)}
                                    options={statusOptions}
                                />
                            </div>
                            <div>
                                <label className="text-xs uppercase tracking-wide text-neutral-400 mb-1.5 block">Assignee</label>
                                <SearchSelect
                                    value={formData.assignedTo}
                                    options={assigneeOptions}
                                    onValueChange={(v) => onFormChange("assignedTo", v)}
                                    onSearchChange={onAssigneeSearch}
                                    loading={usersLoading}
                                    placeholder="Select assignee"
                                    searchPlaceholder="Search users…"
                                    emptyText="No users found"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-xs uppercase tracking-wide text-neutral-400 mb-1.5 block">Start</label>
                                    <input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => onFormChange("startDate", e.target.value)}
                                        className={`${inputClassName} w-full`}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs uppercase tracking-wide text-neutral-400 mb-1.5 block">End</label>
                                    <input
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => onFormChange("endDate", e.target.value)}
                                        className={`${inputClassName} w-full`}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs uppercase tracking-wide text-neutral-400 mb-1.5 block">
                                    Linked item
                                </label>
                                <SearchSelect
                                    value={formData.linkedWorkItemId}
                                    options={linkedItemOptions}
                                    onValueChange={(v) => onFormChange("linkedWorkItemId", v)}
                                    placeholder="No linked item"
                                    searchPlaceholder="Search work items…"
                                    emptyText="No items found"
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className={`${inputClassName} space-y-0.5`}>
                                <p className="text-xs text-neutral-500 uppercase tracking-wide">Assignee</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <img
                                        src={assignee.avatar}
                                        alt={assignee.name}
                                        className="w-5 h-5 rounded-full border border-neutral-700"
                                        referrerPolicy="no-referrer"
                                    />
                                    <span className="text-neutral-200 text-sm">{assignee.name}</span>
                                </div>
                            </div>
                            {item.startDate && (
                                <div className={inputClassName}>
                                    <p className="text-xs text-neutral-500 uppercase tracking-wide">Start date</p>
                                    <p className="text-neutral-200 text-sm mt-1">
                                        {moment(item.startDate).format("MMM DD, YYYY")}
                                    </p>
                                </div>
                            )}
                            {item.endDate && (
                                <div className={inputClassName}>
                                    <p className="text-xs text-neutral-500 uppercase tracking-wide">Due date</p>
                                    <p className="text-neutral-200 text-sm mt-1">
                                        {moment(item.endDate).format("MMM DD, YYYY")}
                                    </p>
                                </div>
                            )}
                            <div className={inputClassName}>
                                <p className="text-xs text-neutral-500 uppercase tracking-wide">Last updated</p>
                                <p className="text-neutral-200 text-sm mt-1">
                                    {moment(item.updatedAt).format("MMM DD, YYYY hh:mm A")}
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Comments (view mode only) */}
            {!isEditMode && <Comments workItemId={item.workItemId} />}

            {/* Footer (edit mode) */}
            {isEditMode && (
                <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-neutral-700/60">
                    <button
                        type="button"
                        onClick={onToggleEdit}
                        className="px-4 py-2 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-sm duration-150"
                    >
                        Cancel
                    </button>
                    <button type="submit" form="ticket-edit-form" className={primaryBtnSmClass}>
                        Save changes
                    </button>
                </div>
            )}
        </>
    );
};

export default ViewEditWorkItemModal;