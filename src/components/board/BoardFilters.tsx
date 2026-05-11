import { Search } from "lucide-react";
import { WorkItemStatus, WorkItemType } from "../../types/workItem";
import ThemeSelect from "../ui/ThemeSelect";
import { BOARD_COLUMNS, STATUS_LABELS } from "../../constants/workItem";
import { User } from "../../types/user";
import { useMemo } from "react";

interface BoardFiltersProps {
    search: string;
    statusFilter: WorkItemStatus | "";
    typeFilter: WorkItemType | "";
    assigneeFilter: string;
    users: User[];
    loading: boolean;
    onSearchChange: (value: string) => void;
    onStatusChange: (value: WorkItemStatus | "") => void;
    onTypeChange: (value: WorkItemType | "") => void;
    onAssigneeChange: (value: string) => void;
}

const BoardFilters = ({
    search,
    statusFilter,
    typeFilter,
    assigneeFilter,
    users,
    loading,
    onSearchChange,
    onStatusChange,
    onTypeChange,
    onAssigneeChange,
}: BoardFiltersProps) => {
    const statusOptions = useMemo(
        () => [
            { value: "", label: "All statuses" },
            ...BOARD_COLUMNS.map((s) => ({ value: s, label: STATUS_LABELS[s] })),
        ],
        []
    );

    const typeOptions = useMemo(
        () => [
            { value: "", label: "All types" },
            { value: "TASK", label: "Task" },
            { value: "STORY", label: "Story" },
        ],
        []
    );

    const assigneeOptions = useMemo(
        () => [
            { value: "", label: "All assignees" },
            ...users.map((u) => ({ value: u.userId, label: u.name })),
        ],
        [users]
    );

    return (
        <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1.5 min-w-[200px] flex-1 max-w-sm">
                <label htmlFor="board-search" className="text-xs text-neutral-400 uppercase tracking-wide">
                    Search
                </label>
                <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                    <input
                        id="board-search"
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Title or description…"
                        className="w-full bg-neutral-900/60 border border-neutral-700 py-2 pl-9 pr-3 rounded-lg outline-none focus:border-emerald-500/60 text-sm duration-200"
                    />
                </div>
            </div>

            <div className="flex flex-col gap-1.5 w-40">
                <span className="text-xs text-neutral-400 uppercase tracking-wide">Status</span>
                <ThemeSelect
                    value={statusFilter}
                    onChange={(v) => onStatusChange(v as WorkItemStatus | "")}
                    options={statusOptions}
                />
            </div>

            <div className="flex flex-col gap-1.5 w-36">
                <span className="text-xs text-neutral-400 uppercase tracking-wide">Type</span>
                <ThemeSelect
                    value={typeFilter}
                    onChange={(v) => onTypeChange(v as WorkItemType | "")}
                    options={typeOptions}
                />
            </div>

            <div className="flex flex-col gap-1.5 w-44">
                <span className="text-xs text-neutral-400 uppercase tracking-wide">Assignee</span>
                <ThemeSelect
                    value={assigneeFilter}
                    onChange={onAssigneeChange}
                    options={assigneeOptions}
                />
            </div>

            {loading && (
                <div className="flex items-center gap-2 text-xs text-emerald-400/80 pb-2">
                    <div className="w-3 h-3 border border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    Updating…
                </div>
            )}
        </div>
    );
};

export default BoardFilters;