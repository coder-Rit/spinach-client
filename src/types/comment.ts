export interface Comment {
  commentId: string;
  comment: string;
  workItemId: string;
  commentReplyId: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  isDeleted: boolean;
}

export interface CommentListResponse {
  total: number;
  page: number;
  size: number;
  hits: Comment[];
}

export interface CreateCommentPayload {
  comment: string;
  commentReplyId?: string;
}

export interface UpdateCommentPayload {
  comment: string;
}

