import { DragEvent } from "react";
import { WorkItem, WorkItemStatus } from "../../types/workItem";
import { STATUS_LABELS } from "../../constants/workItem";
import BoardCard from "./BoardCard";

interface BoardColumnProps {
    status: WorkItemStatus;
    items: WorkItem[];
    projectKey: string;
    menuOpenFor: string | null;
    getAssigneeMeta: (id: string) => { name: string; avatar: string };
    onView: (item: WorkItem) => void;
    onDelete: (item: WorkItem) => void;
    onDragStart: (event: DragEvent<HTMLElement>, itemId: string) => void;
    onDrop: (event: DragEvent<HTMLDivElement>, status: WorkItemStatus) => void;
    onMenuToggle: (id: string | null) => void;
}

const BoardColumn = ({
    status,
    items,
    projectKey,
    menuOpenFor,
    getAssigneeMeta,
    onView,
    onDelete,
    onDragStart,
    onDrop,
    onMenuToggle,
}: BoardColumnProps) => {
    return (
        <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => onDrop(e, status)}
            className="min-w-[240px] max-w-[280px] flex-1 flex flex-col"
        >
            <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-xs uppercase tracking-[0.18em] text-neutral-400 font-medium">
                    {STATUS_LABELS[status]}
                </h3>
                <span className="text-xs text-neutral-500 bg-neutral-800 rounded-full px-2 py-0.5 border border-neutral-700">
                    {items.length}
                </span>
            </div>

            <div className="flex flex-col gap-2 min-h-[80px] rounded-lg transition-colors">
                {items.map((item) => (
                    <BoardCard
                        key={item.workItemId}
                        item={item}
                        displayKey={`${projectKey}-${item.displayId}`}
                        assigneeMeta={getAssigneeMeta(item.assignedTo)}
                        menuOpen={menuOpenFor === item.workItemId}
                        onView={() => onView(item)}
                        onDelete={() => onDelete(item)}
                        onDragStart={(e) => onDragStart(e, item.workItemId)}
                        onMenuToggle={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onMenuToggle(menuOpenFor === item.workItemId ? null : item.workItemId);
                        }}
                        onMenuClose={(e) => e.stopPropagation()}
                    />
                ))}
            </div>
        </div>
    );
};

export default BoardColumn;