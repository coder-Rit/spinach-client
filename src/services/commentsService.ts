import { apiRequest } from "./apiClient";
import {
  Comment,
  CommentListResponse,
  CreateCommentPayload,
  UpdateCommentPayload,
} from "../types/comment";

interface CommentApiResponse {
  comment_id: string;
  comment: string;
  work_item_id: string;
  comment_reply_id: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
  is_deleted: boolean;
}

interface CommentListApiResponse {
  total: number;
  page: number;
  size: number;
  hits: CommentApiResponse[];
}

const toCommentModel = (c: CommentApiResponse): Comment => ({
  commentId: c.comment_id,
  comment: c.comment,
  workItemId: c.work_item_id,
  commentReplyId: c.comment_reply_id,
  createdAt: c.created_at,
  updatedAt: c.updated_at,
  createdBy: c.created_by,
  updatedBy: c.updated_by,
  isDeleted: c.is_deleted,
});

export const listCommentsForWorkItem = async (
  token: string,
  workItemId: string,
  options: { page?: number; size?: number } = {}
): Promise<CommentListResponse> => {
  const params = new URLSearchParams();
  params.append("page", String(options.page || 1));
  params.append("size", String(options.size || 50));

  const response = await apiRequest<CommentListApiResponse>(
    `/comments/work-items/${workItemId}?${params.toString()}`,
    { method: "GET", token }
  );

  return {
    total: response.total,
    page: response.page,
    size: response.size,
    hits: response.hits.map(toCommentModel),
  };
};

export const createCommentForWorkItem = async (
  token: string,
  workItemId: string,
  payload: CreateCommentPayload
): Promise<Comment> => {
  const response = await apiRequest<CommentApiResponse>(`/comments/work-items/${workItemId}`, {
    method: "POST",
    token,
    body: JSON.stringify({
      comment: payload.comment,
      comment_reply_id: payload.commentReplyId || null,
    }),
  });

  return toCommentModel(response);
};

export const updateComment = async (
  token: string,
  commentId: string,
  payload: UpdateCommentPayload
): Promise<Comment> => {
  const response = await apiRequest<CommentApiResponse>(`/comments/${commentId}`, {
    method: "PUT",
    token,
    body: JSON.stringify({ comment: payload.comment }),
  });

  return toCommentModel(response);
};

export const deleteComment = async (token: string, commentId: string): Promise<void> => {
  await apiRequest<{ message: string }>(`/comments/${commentId}`, { method: "DELETE", token });
};

