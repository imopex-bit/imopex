import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import logo from "../assets/logo.webp";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const navLinks = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/mantenimientos", label: "Mantenimientos" },
    { path: "/repuestos", label: "Repuestos" },
    { path: "/importar", label: "Importar" },
  ];

  return (
    <nav className="bg-slate-900/60 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-50 shadow-lg shadow-slate-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg border border-white/10 overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <img src={logo} alt="Imopex Logo" className="w-[85%] h-[85%] object-contain relative z-10" />
            </div>
            <span className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight">
              Imopex
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = location.pathname.startsWith(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={
                    isActive
                      ? "text-indigo-400 font-bold border-b-2 border-indigo-500 pb-1 mt-1"
                      : "text-slate-400 hover:text-indigo-300 font-medium transition-colors mt-1"
                  }
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <button onClick={logout} className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-slate-700/50 rounded-xl transition-all shadow-sm">
            <LogOut size={18} />
            <span className="hidden sm:inline font-semibold text-sm">Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
