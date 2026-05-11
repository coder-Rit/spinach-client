import { X } from "lucide-react";
import { WorkItem } from "../../types/workItem";

interface DeleteWorkItemModalProps {
    item: WorkItem;
    displayKey: string;
    onConfirm: () => void;
    onClose: () => void;
}

const DeleteWorkItemModal = ({ item, displayKey, onConfirm, onClose }: DeleteWorkItemModalProps) => {
    return (
        <div className="fixed z-[50] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[28rem] max-w-[calc(100vw-2rem)] bg-neutral-800 border border-neutral-700 rounded-xl p-6">
            <div className="flex items-start justify-between gap-3 mb-4">
                <h3 className="text-lg text-white font-semibold">Delete Work Item</h3>
                <button
                    type="button"
                    onClick={onClose}
                    className="p-1.5 rounded-md hover:bg-neutral-700 text-neutral-400"
                >
                    <X size={15} />
                </button>
            </div>

            <div className="bg-neutral-900/60 border border-neutral-700 rounded-lg p-3 mb-5">
                <p className="text-xs text-neutral-500 font-mono">{displayKey}</p>
                <p className="text-neutral-200 text-sm mt-1 font-medium">{item.title}</p>
            </div>

            <p className="text-neutral-400 text-sm mb-6">
                This action cannot be undone. The work item and all associated comments will be permanently
                removed.
            </p>

            <div className="flex justify-end gap-3">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-sm duration-150"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={onConfirm}
                    className="px-4 py-2 rounded-lg bg-red-700 hover:bg-red-600 text-white text-sm font-medium duration-150"
                >
                    Delete permanently
                </button>
            </div>
        </div>
    );
};

export default DeleteWorkItemModal;