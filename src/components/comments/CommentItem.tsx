import moment from "moment";
import { Comment } from "../../types/comment";
import { inputClassName, primaryBtnSmClass } from "../../constants/workItem";

interface CommentItemProps {
    comment: Comment;
    depth: number;
    isOwner: boolean;
    isEditing: boolean;
    editText: string;
    authorMeta: { name: string; avatar: string };
    onReply: (id: string) => void;
    onEdit: (comment: Comment) => void;
    onDelete: (id: string) => void;
    onEditTextChange: (text: string) => void;
    onSaveEdit: () => void;
    onCancelEdit: () => void;
}

const CommentItem = ({
    comment: c,
    depth,
    isOwner,
    isEditing,
    editText,
    authorMeta,
    onReply,
    onEdit,
    onDelete,
    onEditTextChange,
    onSaveEdit,
    onCancelEdit,
}: CommentItemProps) => {
    return (
        <div
            className={`border border-neutral-700/80 rounded-lg p-3 bg-neutral-900/30 ${depth ? "ml-6 border-l-2 border-l-neutral-600" : ""
                }`}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                    <img
                        src={authorMeta.avatar}
                        alt={authorMeta.name}
                        className="w-6 h-6 rounded-full border border-neutral-700 shrink-0"
                        referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                        <p className="text-sm text-neutral-200 font-medium truncate">{authorMeta.name}</p>
                        <p className="text-xs text-neutral-500">
                            {moment(c.createdAt).format("MMM DD, YYYY hh:mm A")}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 text-xs text-neutral-400">
                    <button
                        type="button"
                        onClick={() => onReply(c.commentId)}
                        className="hover:text-emerald-400 duration-150"
                    >
                        Reply
                    </button>
                    {isOwner && (
                        <>
                            <span className="text-neutral-700">·</span>
                            <button
                                type="button"
                                onClick={() => onEdit(c)}
                                className="hover:text-neutral-200 duration-150"
                            >
                                Edit
                            </button>
                            <span className="text-neutral-700">·</span>
                            <button
                                type="button"
                                onClick={() => onDelete(c.commentId)}
                                className="hover:text-red-400 duration-150"
                            >
                                Delete
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="mt-2.5">
                {isEditing ? (
                    <div className="space-y-2">
                        <textarea
                            value={editText}
                            onChange={(e) => onEditTextChange(e.target.value)}
                            className={`${inputClassName} w-full min-h-[80px] text-sm`}
                            autoFocus
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={onCancelEdit}
                                className="px-3 py-1.5 text-sm rounded-md bg-neutral-700 hover:bg-neutral-600 duration-150"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={onSaveEdit}
                                className="px-3 py-1.5 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 font-medium duration-150"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-neutral-300 whitespace-pre-wrap leading-relaxed">{c.comment}</p>
                )}
            </div>
        </div>
    );
};

export default CommentItem;