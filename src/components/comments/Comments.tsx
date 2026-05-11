import { useEffect, useState } from "react";
import { Comment } from "../../types/comment";
import { useAuthContext } from "../../hooks/useAuthContext";
import {
    createCommentForWorkItem,
    deleteComment,
    listCommentsForWorkItem,
    updateComment,
} from "../../services/commentsService";
import CommentItem from "./CommentItem";
import { inputClassName, primaryBtnSmClass } from "../../constants/workItem";

interface CommentsProps {
    workItemId: string;
}

const Comments = ({ workItemId }: CommentsProps) => {
    const { user } = useAuthContext();
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [newComment, setNewComment] = useState("");
    const [replyToId, setReplyToId] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editText, setEditText] = useState("");

    useEffect(() => {
        if (!user || !workItemId) return;
        setLoading(true);
        setError(null);
        listCommentsForWorkItem(user.accessToken, workItemId, { page: 1, size: 200 })
            .then((res) => setComments(res.hits.filter((c) => !c.isDeleted)))
            .catch((err) => setError(err instanceof Error ? err.message : "Unable to load comments"))
            .finally(() => setLoading(false));
    }, [workItemId, user]);

    const handleAdd = async () => {
        if (!user || !newComment.trim()) return;
        try {
            const created = await createCommentForWorkItem(user.accessToken, workItemId, {
                comment: newComment.trim(),
                commentReplyId: replyToId || undefined,
            });
            setComments((prev) => [created, ...prev]);
            setNewComment("");
            setReplyToId(null);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to add comment");
        }
    };

    const handleSaveEdit = async () => {
        if (!user || !editingId || !editText.trim()) return;
        try {
            const updated = await updateComment(user.accessToken, editingId, {
                comment: editText.trim(),
            });
            setComments((prev) => prev.map((c) => (c.commentId === updated.commentId ? updated : c)));
            setEditingId(null);
            setEditText("");
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to update comment");
        }
    };

    const handleDelete = async (commentId: string) => {
        if (!user) return;
        try {
            await deleteComment(user.accessToken, commentId);
            setComments((prev) => prev.filter((c) => c.commentId !== commentId));
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to delete comment");
        }
    };

    // Build threaded comment tree
    const byParent: Record<string, Comment[]> = {};
    const roots: Comment[] = [];
    for (const c of comments) {
        if (c.commentReplyId) {
            byParent[c.commentReplyId] = [...(byParent[c.commentReplyId] || []), c];
        } else {
            roots.push(c);
        }
    }
    roots.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    Object.values(byParent).forEach((arr) =>
        arr.sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1))
    );

    const ordered: Array<{ comment: Comment; depth: number }> = [];
    for (const root of roots) {
        ordered.push({ comment: root, depth: 0 });
        for (const r of byParent[root.commentId] || []) {
            ordered.push({ comment: r, depth: 1 });
        }
    }

    const getAuthorMeta = (userId: string | null) => {
        const name = userId ? "User" : "Unknown";
        return { name, avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}` };
    };

    return (
        <div className="border-t border-neutral-700/60 mt-6 pt-5">
            <div className="flex items-center justify-between mb-4">
                <p className="text-xs uppercase tracking-[0.18em] text-neutral-400 font-medium">
                    Comments ({comments.length})
                </p>
                {loading && <span className="text-xs text-neutral-500">Loading…</span>}
            </div>

            {error && (
                <p className="bg-red-950/20 border border-red-800/40 rounded-lg px-3 py-2 text-sm text-red-300 mb-3">
                    {error}
                </p>
            )}

            {replyToId && (
                <div className="flex items-center justify-between text-xs text-neutral-400 mb-2 px-1">
                    <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                        Replying to a comment
                    </span>
                    <button
                        type="button"
                        onClick={() => setReplyToId(null)}
                        className="text-neutral-500 hover:text-neutral-200 underline"
                    >
                        Cancel
                    </button>
                </div>
            )}

            <div className="space-y-2 mb-4">
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment…"
                    className={`${inputClassName} w-full min-h-[88px] text-sm resize-none`}
                />
                {newComment.trim().length > 0 && (
                    <div className="flex justify-end">
                        <button type="button" onClick={handleAdd} className={primaryBtnSmClass}>
                            Post comment
                        </button>
                    </div>
                )}
            </div>

            <div className="space-y-2 max-h-[20rem] overflow-y-auto pr-1 -mr-1">
                {ordered.length === 0 && !loading && (
                    <p className="text-sm text-neutral-500 py-2">No comments yet. Be the first!</p>
                )}
                {ordered.map(({ comment: c, depth }) => (
                    <CommentItem
                        key={c.commentId}
                        comment={c}
                        depth={depth}
                        isOwner={Boolean(user?.userId && c.createdBy && user.userId === c.createdBy)}
                        isEditing={editingId === c.commentId}
                        editText={editText}
                        authorMeta={getAuthorMeta(c.createdBy)}
                        onReply={setReplyToId}
                        onEdit={(comment) => {
                            setEditingId(comment.commentId);
                            setEditText(comment.comment);
                        }}
                        onDelete={handleDelete}
                        onEditTextChange={setEditText}
                        onSaveEdit={handleSaveEdit}
                        onCancelEdit={() => {
                            setEditingId(null);
                            setEditText("");
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default Comments;