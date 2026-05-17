import { Link, NavLink, useNavigate } from "react-router-dom";
import { LogOut, LayoutDashboard, Moon, Sun } from "lucide-react";
import SpinachLogo from "./SpinachLogo";
import { useAuthContext } from "../hooks/useAuthContext";
import { useLogout } from "../hooks/useLogout";
import { useTheme } from "../context/ThemeContext";

const Navbar = () => {
  const { user, dispatch } = useAuthContext();
  const { mode, toggleMode } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    dispatch({ type: "LOGOUT" });
    navigate("/login");
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 ${isActive
      ? "bg-emerald-600/20 text-emerald-400 border border-emerald-600/30"
      : "text-neutral-400 hover:text-white hover:bg-neutral-800"
    }`;

  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    user?.name || user?.email || "User"
  )}`;

  const themeToggleButton = (
    <button
      type="button"
      onClick={toggleMode}
      className="inline-flex items-center gap-2 rounded-lg border border-neutral-600 bg-neutral-800/80 px-3 py-2 text-sm text-neutral-200 hover:border-emerald-600/50 hover:bg-neutral-800"
    >
      {mode === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );

  return (
    <header className="sticky top-0 z-30 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 h-14 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 text-white font-semibold text-lg shrink-0">
          <SpinachLogo size={22} withFrame alt="" />
          <span>Spinach</span>
        </Link>

        {user && (
          <nav className="flex items-center gap-1">
            <NavLink to="/" end className={navLinkClass}>
              <LayoutDashboard size={14} />
              Projects
            </NavLink>
            <NavLink to="/chat" className={navLinkClass}>
              <SpinachLogo size={14} alt="" />
              Spina AI
            </NavLink>
          </nav>
        )}

        <div className="flex items-center gap-3">
          {!user && (
            <>
              {themeToggleButton}
            
            </>
          )}

          {user && (
            <>
              <div className="hidden sm:flex items-center gap-2">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name ?? "User")}&size=28`}
                  alt={user.name ?? "User"}
                  className="w-7 h-7 rounded-full border border-neutral-600"
                />
                <span className="text-sm text-neutral-300">{user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-red-400 px-2 py-1.5 rounded-lg hover:bg-red-500/10 duration-200"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
