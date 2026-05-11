import { useState } from "react";
import { useAuthContext } from "./useAuthContext";
import { signupUser } from "../services/authService";

export const useSignup = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { dispatch } = useAuthContext();

  const signup = async (name: string, email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const user = await signupUser({ name, email, password });
      dispatch({ type: "LOGIN", payload: user });
      localStorage.setItem("user", JSON.stringify(user));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to signup");
    } finally {
      setLoading(false);
    }
  };

  return { signup, error, loading };
};
