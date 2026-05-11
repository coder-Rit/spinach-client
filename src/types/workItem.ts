export type WorkItemType = "STORY" | "TASK";

export type WorkItemStatus =
  | "TODO"
  | "IN_PROGRESS"
  | "CODE_COMPLETE"
  | "DEPLOYED_ON_STAGE"
  | "DONE";

export interface WorkItem {
  workItemId: string;
  projectId: string;
  displayId: number;
  itemType: WorkItemType;
  title: string;
  description: string;
  status: WorkItemStatus;
  startDate: string | null;
  endDate: string | null;
  assignedBy: string;
  assignedTo: string;
  linkedWorkItemId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WorkItemListResponse {
  total: number;
  page: number;
  size: number;
  hits: WorkItem[];
}

export interface CreateWorkItemPayload {
  itemType: WorkItemType;
  title: string;
  description: string;
  status: WorkItemStatus;
  startDate?: string;
  endDate?: string;
  assignedTo: string;
  linkedWorkItemId?: string;
}

export interface UpdateWorkItemPayload {
  itemType?: WorkItemType;
  title?: string;
  description?: string;
  status?: WorkItemStatus;
  startDate?: string;
  endDate?: string;
  assignedTo?: string;
  linkedWorkItemId?: string;
}
