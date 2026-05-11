import { apiRequest } from "./apiClient";
import {
  CreateProjectPayload,
  Project,
  ProjectFilters,
  ProjectListResponse,
  UpdateProjectPayload,
} from "../types/project";

interface ProjectApiResponse {
  project_id: string;
  title: string;
  status: "OPEN" | "CLOSE";
  description: string;
  managed_by: string;
  created_at: string;
  updated_at: string;
}

interface ProjectListApiResponse {
  total: number;
  page: number;
  size: number;
  hits: ProjectApiResponse[];
}

const toProjectModel = (project: ProjectApiResponse): Project => ({
  projectId: project.project_id,
  title: project.title,
  description: project.description,
  status: project.status,
  managedBy: project.managed_by,
  createdAt: project.created_at,
  updatedAt: project.updated_at,
});

const buildProjectsQuery = (filters: ProjectFilters) => {
  const params = new URLSearchParams();
  if (filters.search) params.append("search", filters.search);
  if (filters.status) params.append("status", filters.status);
  params.append("page", String(filters.page || 1));
  params.append("size", String(filters.size || 10));
  return params.toString();
};

export const listProjects = async (token: string, filters: ProjectFilters): Promise<ProjectListResponse> => {
  const query = buildProjectsQuery(filters);
  const response = await apiRequest<ProjectListApiResponse>(`/projects?${query}`, {
    method: "GET",
    token,
  });

  return {
    total: response.total,
    page: response.page,
    size: response.size,
    hits: response.hits.map(toProjectModel),
  };
};

export const createProject = async (token: string, payload: CreateProjectPayload): Promise<Project> => {
  const response = await apiRequest<ProjectApiResponse>("/projects", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
  return toProjectModel(response);
};

export const getProjectById = async (token: string, projectId: string): Promise<Project> => {
  const response = await apiRequest<ProjectApiResponse>(`/projects/${projectId}`, {
    method: "GET",
    token,
  });
  return toProjectModel(response);
};

export const updateProject = async (
  token: string,
  projectId: string,
  payload: UpdateProjectPayload
): Promise<Project> => {
  const response = await apiRequest<ProjectApiResponse>(`/projects/${projectId}`, {
    method: "PUT",
    token,
    body: JSON.stringify(payload),
  });
  return toProjectModel(response);
};

export const deleteProject = async (token: string, projectId: string): Promise<void> => {
  await apiRequest<{ message: string }>(`/projects/${projectId}`, {
    method: "DELETE",
    token,
  });
};
