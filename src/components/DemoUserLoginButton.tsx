import { User } from "lucide-react";
import { useLogin } from "../hooks/useLogin";
import { DEFAULT_DEMO_USER } from "../constants/defaultUser";

type DemoUserLoginButtonProps = {
  onLogin?: (email: string, password: string) => Promise<void>;
  loading?: boolean;
  showError?: boolean;
};

const DemoUserLoginButton = ({
  onLogin,
  loading: loadingProp,
  showError = true,
}: DemoUserLoginButtonProps) => {
  const internal = useLogin();
  const login = onLogin ?? internal.login;
  const loading = loadingProp ?? internal.loading;
  const error = onLogin ? null : internal.error;

  const handleDemoLogin = () => {
    void login(DEFAULT_DEMO_USER.email, DEFAULT_DEMO_USER.password);
  };

  return (
    <div className="flex flex-col gap-3 w-full max-w-sm">
      <button
        type="button"
        disabled={loading}
        onClick={handleDemoLogin}
        className="inline-flex items-center justify-center gap-2 border border-neutral-600 bg-neutral-900 text-neutral-100 py-3 px-6 rounded-xl hover:border-emerald-600/50 hover:bg-neutral-800 duration-300 disabled:opacity-60 font-medium w-full"
      >
        <User size={16} className="text-emerald-400" />
        Continue as {DEFAULT_DEMO_USER.name}
      </button>
      {showError && error && (
        <p className="bg-neutral-800 rounded-lg p-4 text-neutral-200 border border-neutral-600 text-sm text-left">
          {error}
        </p>
      )}
    </div>
  );
};

export default DemoUserLoginButton;
