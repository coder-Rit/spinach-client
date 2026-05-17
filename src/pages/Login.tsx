import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { useLogin } from "../hooks/useLogin";
import DemoUserLoginButton from "../components/DemoUserLoginButton";
import { Lock, Mail } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, error, loading } = useLogin();

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await login(email, password);
  };

  return (
    <form onSubmit={handleLogin} className="login-form flex flex-col gap-5 py-20 mx-auto max-w-sm">
      <h2 className="text-4xl font-medium text-white mb-10">Login</h2>

      <div className="form-control flex flex-col gap-2 ">
        <label htmlFor="email" className="cursor-pointer hover:text-white duration-300">
          <span className="inline-flex items-center gap-2">
            <Mail size={14} />
            Email Address
          </span>
        </label>
        <input
          type="email"
          id="email"
          placeholder="tanisha@express.dev"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="bg-transparent border border-neutral-500 py-3 px-5 rounded-xl outline-none focus:border-white duration-300"
        />
      </div>

      <div className="form-control flex flex-col gap-2 ">
        <label htmlFor="password" className="cursor-pointer hover:text-white duration-300">
          <span className="inline-flex items-center gap-2">
            <Lock size={14} />
            Password
          </span>
        </label>

        <input
          type="password"
          id="password"
          placeholder="Enter your password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="bg-transparent border border-neutral-500 py-3 px-5 rounded-xl outline-none focus:border-white duration-300"
        />
      </div>

      <button
        disabled={loading}
        type="submit"
        className="bg-emerald-600 text-white py-3 rounded-xl hover:bg-emerald-500 duration-300 mt-3 disabled:opacity-60 font-medium shadow-sm shadow-emerald-950/30"
      >
        Log In
      </button>

      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center" aria-hidden>
          <div className="w-full border-t border-neutral-700" />
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-wide">
          <span className="bg-neutral-950 px-3 text-neutral-500">or</span>
        </div>
      </div>

      <DemoUserLoginButton onLogin={login} loading={loading} showError={false} />

      <p className="text-center text-sm text-neutral-500">
        No account?{" "}
        <Link to="/signup" className="text-emerald-500 hover:text-emerald-400">
          Sign up
        </Link>
      </p>

      {error && (
        <p className="bg-neutral-800 rounded-lg p-5 text-neutral-200 border border-neutral-600">{error}</p>
      )}
    </form>
  );
};

export default Login;
