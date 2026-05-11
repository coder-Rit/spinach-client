import { createContext, ReactNode, useReducer } from "react";
import { Project } from "../types/project";

interface ProjectState {
  projects: Project[];
}

type ProjectAction =
  | { type: "SET_PROJECTS"; payload: Project[] }
  | { type: "CREATE_PROJECT"; payload: Project }
  | { type: "UPDATE_PROJECT"; payload: Project }
  | { type: "DELETE_PROJECT"; payload: Project };

interface ProjectContextValue extends ProjectState {
  dispatch: React.Dispatch<ProjectAction>;
}

const initialState: ProjectState = {
  projects: [],
};

export const projectsReducer = (state: ProjectState, action: ProjectAction): ProjectState => {
  switch (action.type) {
    case "SET_PROJECTS":
      return { ...state, projects: action.payload };
    case "CREATE_PROJECT":
      return { ...state, projects: [action.payload, ...state.projects] };
    case "UPDATE_PROJECT":
      return {
        ...state,
        projects: [
          action.payload,
          ...state.projects.filter((project) => project.projectId !== action.payload.projectId),
        ],
      };
    case "DELETE_PROJECT":
      return {
        ...state,
        projects: state.projects.filter((project) => project.projectId !== action.payload.projectId),
      };
    default:
      return state;
  }
};

export const ProjectContext = createContext<ProjectContextValue | null>(null);

interface ProjectContextProviderProps {
  children: ReactNode;
}

export const ProjectContextProvider = ({ children }: ProjectContextProviderProps) => {
  const [state, dispatch] = useReducer(projectsReducer, initialState);

  return <ProjectContext.Provider value={{ ...state, dispatch }}>{children}</ProjectContext.Provider>;
};
