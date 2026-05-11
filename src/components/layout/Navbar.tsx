import { Link, useLocation, useNavigate } from "react-router-dom";
import { MessageSquare, LayoutDashboard, LogOut } from "lucide-react";
import { useAuthContext } from "../../hooks/useAuthContext";

const Navbar = () => {
    const { pathname } = useLocation();
    const { user, dispatch } = useAuthContext();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("user");
        dispatch({ type: "LOGOUT" });
        navigate("/login");
    };

    const linkClass = (path: string) => {
        const isActive = path === "/" ? pathname === "/" : pathname.startsWith(path);
        return `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium duration-200 transition-colors ${isActive
                ? "bg-emerald-600/20 text-emerald-400 border border-emerald-600/30"
                : "text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 border border-transparent"
            }`;
    };

    return (
        <header className="sticky top-0 z-30 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md">
            <div className="w-full px-6 lg:px-10 h-14 flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5">
                    <img
                        src="/images/spinach.png"
                        alt="Spinach"
                        className="w-7 h-7 rounded-full border border-neutral-700"
                    />
                    <span className="font-semibold text-white text-sm tracking-tight">Spinach</span>
                </div>

                {user && (
                    <nav className="flex items-center gap-1">
                        <Link to="/" className={linkClass("/")}>
                            <LayoutDashboard size={15} />
                            Projects
                        </Link>
                        <Link to="/chat" className={linkClass("/chat")}>
                            <MessageSquare size={15} />
                            Spina AI
                        </Link>
                    </nav>
                )}

                {user && (
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <img
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "User")}&size=32`}
                                alt="avatar"
                                className="w-7 h-7 rounded-full border border-neutral-700"
                                referrerPolicy="no-referrer"
                            />
                            <span className="text-sm text-neutral-300 hidden sm:block">{user.name}</span>
                        </div>
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="flex items-center gap-1.5 text-neutral-400 hover:text-red-400 text-sm px-2 py-1.5 rounded-md hover:bg-neutral-800 duration-200"
                            title="Sign out"
                        >
                            <LogOut size={15} />
                            <span className="hidden sm:block">Sign out</span>
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Navbar;