import { createContext, ReactNode, useReducer } from "react";
import { AuthUser } from "../types/auth";

interface AuthState {
  user: AuthUser | null;
}

type AuthAction =
  | { type: "LOGIN"; payload: AuthUser }
  | { type: "LOGOUT" };

interface AuthContextValue extends AuthState {
  dispatch: React.Dispatch<AuthAction>;
}

const storedUser = localStorage.getItem("user");
const initialState: AuthState = {
  user: storedUser ? (JSON.parse(storedUser) as AuthUser) : null,
};

export const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "LOGIN":
      return { ...state, user: action.payload };
    case "LOGOUT":
      return { ...state, user: null };
    default:
      return state;
  }
};

export const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthContextProviderProps {
  children: ReactNode;
}

export const AuthContextProvider = ({ children }: AuthContextProviderProps) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  return <AuthContext.Provider value={{ ...state, dispatch }}>{children}</AuthContext.Provider>;
};
