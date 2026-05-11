import { DragEvent } from "react";
import { GripVertical, MoreVertical } from "lucide-react";
import { WorkItem } from "../../types/workItem";
import { typeChipClass, statusChipClass, STATUS_LABELS } from "../../constants/workItem";
import ReadMoreText from "../ui/ReadMoreText";

interface BoardCardProps {
    item: WorkItem;
    displayKey: string;
    assigneeMeta: { name: string; avatar: string };
    menuOpen: boolean;
    onView: () => void;
    onDelete: () => void;
    onDragStart: (event: DragEvent<HTMLElement>) => void;
    onMenuToggle: (e: React.MouseEvent) => void;
    onMenuClose: (e: React.MouseEvent) => void;
}

const BoardCard = ({
    item,
    displayKey,
    assigneeMeta,
    menuOpen,
    onView,
    onDelete,
    onDragStart,
    onMenuToggle,
    onMenuClose,
}: BoardCardProps) => {
    return (
        <div
            draggable
            onDragStart={onDragStart}
            className="w-full text-left p-3 border border-neutral-700 rounded-lg cursor-move hover:bg-neutral-900/60 hover:border-neutral-600 duration-200 bg-neutral-900/20"
        >
            <div className="flex items-start justify-between gap-2">
                <button
                    type="button"
                    onClick={onView}
                    className="flex-1 text-left min-w-0"
                >
                    <p className="text-xs text-neutral-500 flex items-center gap-1">
                        <GripVertical size={11} className="shrink-0" />
                        {displayKey}
                    </p>
                    <h4 className="font-medium mt-1 text-sm text-neutral-100 leading-snug line-clamp-2">
                        {item.title}
                    </h4>
               
                </button>

                <div className="relative shrink-0">
                    <button
                        type="button"
                        onClick={onMenuToggle}
                        className="p-1 rounded-md hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200 duration-150"
                        aria-label="Actions"
                    >
                        <MoreVertical size={14} />
                    </button>

                    {menuOpen && (
                        <div
                            onClick={onMenuClose}
                            className="absolute right-0 mt-1 w-36 rounded-lg border border-neutral-700 bg-neutral-900 shadow-xl z-20"
                        >
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete();
                                }}
                                className="w-full text-left px-3 py-2 text-sm text-red-300 hover:bg-neutral-800 rounded-lg"
                            >
                                Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <span className={typeChipClass[item.itemType]}>{item.itemType}</span>
                <span className={statusChipClass[item.status]}>{STATUS_LABELS[item.status]}</span>
            </div>

            <div className="mt-2.5 flex items-center gap-1.5">
                <img
                    src={assigneeMeta.avatar}
                    alt={assigneeMeta.name}
                    className="w-5 h-5 rounded-full border border-neutral-700 shrink-0"
                    referrerPolicy="no-referrer"
                />
                <span className="text-xs text-neutral-400 truncate">{assigneeMeta.name}</span>
            </div>
        </div>
    );
};

export default BoardCard;