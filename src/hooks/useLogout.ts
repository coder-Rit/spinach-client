import { useAuthContext } from "./useAuthContext";
import { useProjectsContext } from "./useProjectsContext";

export const useLogout = () => {
  const { dispatch: authDispatch } = useAuthContext();
  const { dispatch: projectsDispatch } = useProjectsContext();

  const logout = () => {
    localStorage.removeItem("user");
    authDispatch({ type: "LOGOUT" });
    projectsDispatch({ type: "SET_PROJECTS", payload: [] });
  };

  return { logout };
};
