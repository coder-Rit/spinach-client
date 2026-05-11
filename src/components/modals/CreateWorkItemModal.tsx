import { FormEvent } from "react";
import { CalendarDays, X } from "lucide-react";
import { WorkItemStatus, WorkItemType } from "../../types/workItem";
import { WorkItem } from "../../types/workItem";
import { User } from "../../types/user";
import { WorkItemFormData } from "../../types/workItemForm";
import ThemeSelect from "../ui/ThemeSelect";
import SearchSelect from "../ui/SearchSelect";
import { inputClassName, primaryBtnSmClass, BOARD_COLUMNS, STATUS_LABELS } from "../../constants/workItem";
import { useMemo } from "react";

interface CreateWorkItemModalProps {
    formData: WorkItemFormData;
    users: User[];
    usersLoading: boolean;
    workItems: WorkItem[];
    projectKey: string;
    onFormChange: (field: keyof WorkItemFormData, value: string) => void;
    onAssigneeSearch: (search: string) => void;
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
    onClose: () => void;
}

const CreateWorkItemModal = ({
    formData,
    users,
    usersLoading,
    workItems,
    projectKey,
    onFormChange,
    onAssigneeSearch,
    onSubmit,
    onClose,
}: CreateWorkItemModalProps) => {
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
            ...workItems.map((item) => ({
                value: item.workItemId,
                label: `${projectKey}-${item.displayId} — ${item.title}`,
            })),
        ],
        [workItems, projectKey]
    );

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl text-white font-semibold">New Work Item</h3>
                <button
                    type="button"
                    onClick={onClose}
                    className="p-2 rounded-lg bg-neutral-700/50 hover:bg-neutral-700 border border-neutral-600 text-neutral-400 hover:text-neutral-200 duration-150"
                >
                    <X size={16} />
                </button>
            </div>

            <form onSubmit={onSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
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
                </div>

                <div>
                    <label className="text-xs uppercase tracking-wide text-neutral-400 mb-1.5 block">Title *</label>
                    <input
                        value={formData.title}
                        onChange={(e) => onFormChange("title", e.target.value)}
                        placeholder="Work item title"
                        required
                        className={`${inputClassName} w-full`}
                    />
                </div>

                <div>
                    <label className="text-xs uppercase tracking-wide text-neutral-400 mb-1.5 block">Description</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => onFormChange("description", e.target.value)}
                        placeholder="Optional description…"
                        className={`${inputClassName} w-full min-h-[100px] resize-none`}
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

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs uppercase tracking-wide text-neutral-400 mb-1.5 block">Start date</label>
                        <input
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => onFormChange("startDate", e.target.value)}
                            className={`${inputClassName} w-full`}
                        />
                    </div>
                    <div>
                        <label className="text-xs uppercase tracking-wide text-neutral-400 mb-1.5 block">End date</label>
                        <input
                            type="date"
                            value={formData.endDate}
                            onChange={(e) => onFormChange("endDate", e.target.value)}
                            className={`${inputClassName} w-full`}
                        />
                    </div>
                </div>

                <p className="text-xs text-neutral-500 flex items-center gap-1.5 -mt-1">
                    <CalendarDays size={13} />
                    Start defaults to today. End date is optional.
                </p>

                <div>
                    <label className="text-xs uppercase tracking-wide text-neutral-400 mb-1.5 block">
                        Linked item (optional)
                    </label>
                    <SearchSelect
                        value={formData.linkedWorkItemId}
                        options={linkedItemOptions}
                        onValueChange={(v) => onFormChange("linkedWorkItemId", v)}
                        placeholder="Link to another work item…"
                        searchPlaceholder="Search work items…"
                        emptyText="No work items found"
                    />
                </div>

                <div className="flex justify-end gap-3 pt-2 border-t border-neutral-700/60 mt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-sm duration-150"
                    >
                        Cancel
                    </button>
                    <button type="submit" className={primaryBtnSmClass}>
                        Create Work Item
                    </button>
                </div>
            </form>
        </>
    );
};

export default CreateWorkItemModal;