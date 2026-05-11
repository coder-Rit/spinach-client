import { useState } from "react";
import { useAuthContext } from "./useAuthContext";
import { loginUser } from "../services/authService";

export const useLogin = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { dispatch } = useAuthContext();

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const user = await loginUser({ email, password });
      dispatch({ type: "LOGIN", payload: user });
      localStorage.setItem("user", JSON.stringify(user));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to login");
    } finally {
      setLoading(false);
    }
  };

  return { login, error, loading };
};
