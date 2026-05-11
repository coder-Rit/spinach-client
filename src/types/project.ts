export type ProjectStatus = "OPEN" | "CLOSE";

export interface Project {
  projectId: string;
  title: string;
  description: string;
  status: ProjectStatus;
  managedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectListResponse {
  total: number;
  page: number;
  size: number;
  hits: Project[];
}

export interface ProjectFilters {
  search?: string;
  status?: ProjectStatus;
  page?: number;
  size?: number;
}

export interface CreateProjectPayload {
  title: string;
  description: string;
  status: ProjectStatus;
}

export interface UpdateProjectPayload {
  title?: string;
  description?: string;
  status?: ProjectStatus;
}
