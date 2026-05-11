import { apiRequest } from "./apiClient";
import {
  CreateWorkItemPayload,
  UpdateWorkItemPayload,
  WorkItem,
  WorkItemListResponse,
  WorkItemStatus,
  WorkItemType,
} from "../types/workItem";

interface WorkItemApiResponse {
  work_item_id: string;
  project_id: string;
  display_id: number;
  item_type: WorkItemType;
  title: string;
  description: string;
  status: WorkItemStatus;
  start_date: string | null;
  end_date: string | null;
  assigned_by: string;
  assigned_to: string;
  linked_work_item_id: string | null;
  created_at: string;
  updated_at: string;
}

interface WorkItemListApiResponse {
  total: number;
  page: number;
  size: number;
  hits: WorkItemApiResponse[];
}

const toWorkItemModel = (item: WorkItemApiResponse): WorkItem => ({
  workItemId: item.work_item_id,
  projectId: item.project_id,
  displayId: item.display_id,
  itemType: item.item_type,
  title: item.title,
  description: item.description,
  status: item.status,
  startDate: item.start_date,
  endDate: item.end_date,
  assignedBy: item.assigned_by,
  assignedTo: item.assigned_to,
  linkedWorkItemId: item.linked_work_item_id,
  createdAt: item.created_at,
  updatedAt: item.updated_at,
});

export interface WorkItemListFilters {
  projectId: string;
  page?: number;
  size?: number;
  search?: string;
  status?: WorkItemStatus;
  itemType?: WorkItemType;
  assignedTo?: string;
}

export const listWorkItems = async (
  token: string,
  filters: WorkItemListFilters
): Promise<WorkItemListResponse> => {
  const params = new URLSearchParams();
  params.append("project_id", filters.projectId);
  params.append("page", String(filters.page || 1));
  params.append("size", String(filters.size || 200));
  if (filters.search?.trim()) {
    params.append("search", filters.search.trim());
  }
  if (filters.status) {
    params.append("status", filters.status);
  }
  if (filters.itemType) {
    params.append("item_type", filters.itemType);
  }
  if (filters.assignedTo) {
    params.append("assigned_to", filters.assignedTo);
  }

  const response = await apiRequest<WorkItemListApiResponse>(`/work-items?${params.toString()}`, {
    method: "GET",
    token,
  });

  return {
    total: response.total,
    page: response.page,
    size: response.size,
    hits: response.hits.map(toWorkItemModel),
  };
};

export const createWorkItem = async (
  token: string,
  projectId: string,
  payload: CreateWorkItemPayload
): Promise<WorkItem> => {
  const response = await apiRequest<WorkItemApiResponse>(`/work-items/projects/${projectId}`, {
    method: "POST",
    token,
    body: JSON.stringify({
      item_type: payload.itemType,
      title: payload.title,
      description: payload.description,
      status: payload.status,
      start_date: payload.startDate || null,
      end_date: payload.endDate || null,
      assigned_to: payload.assignedTo,
      linked_work_item_id: payload.linkedWorkItemId || null,
    }),
  });

  return toWorkItemModel(response);
};

export const updateWorkItem = async (
  token: string,
  workItemId: string,
  payload: UpdateWorkItemPayload
): Promise<WorkItem> => {
  const response = await apiRequest<WorkItemApiResponse>(`/work-items/${workItemId}`, {
    method: "PUT",
    token,
    body: JSON.stringify({
      item_type: payload.itemType,
      title: payload.title,
      description: payload.description,
      status: payload.status,
      start_date: payload.startDate || null,
      end_date: payload.endDate || null,
      assigned_to: payload.assignedTo,
      linked_work_item_id: payload.linkedWorkItemId || null,
    }),
  });

  return toWorkItemModel(response);
};

export const deleteWorkItem = async (token: string, workItemId: string): Promise<void> => {
  await apiRequest<{ message: string }>(`/work-items/${workItemId}`, {
    method: "DELETE",
    token,
  });
};
