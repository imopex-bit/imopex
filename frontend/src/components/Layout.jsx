import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  History, 
  Package, 
  UploadCloud, 
  Users, 
  LogOut, 
  ChevronRight, 
  UserCircle 
} from "lucide-react";
import logo from "../assets/logo.webp";

export default function Layout() {
  // Cerrado por defecto
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        setUserEmail(u.email || "");
      } catch {
        setUserEmail("");
      }
    }
  }, []);

  // Cerrar el aside al cambiar de ruta
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const menuItems = [
    { path: "/dashboard", label: "Panel", icon: LayoutDashboard },
    { path: "/mantenimientos", label: "Mantenimientos", icon: History },
    { path: "/repuestos", label: "Repuestos", icon: Package },
    { path: "/importar", label: "Importar Excel", icon: UploadCloud },
    { path: "/personal", label: "Personal", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans flex flex-col relative">
      {/* BACKGROUND DECORATIVE GRADIENTS */}
      <div className="absolute top-0 left-0 w-[40%] h-[40%] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-0 right-0 w-[40%] h-[40%] bg-cyan-500/5 blur-[150px] rounded-full pointer-events-none z-0" />

      {/* ═══════════════════════════════════════
          TOP NAVBAR — visible cuando aside cerrado
          ═══════════════════════════════════════ */}
      <AnimatePresence>
        {!isOpen && (
          <motion.header
            key="topbar"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/80 h-16 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40 shadow-md"
          >
            {/* Logo + Hamburger */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsOpen(true)}
                className="p-2 hover:bg-slate-800 rounded-xl transition text-slate-400 hover:text-white"
                title="Abrir menú"
              >
                <Menu size={22} />
              </button>
              
              <div className="flex items-center gap-2.5 ml-1">
                <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-lg overflow-hidden">
                  <img src={logo} alt="Imopex Logo" className="w-[80%] h-[80%] object-contain" />
                </div>
                <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight hidden sm:inline-block">
                  Imopex
                </span>
              </div>
            </div>

            {/* User + Logout */}
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 bg-slate-950/40 border border-slate-800/80 py-1.5 px-3 rounded-xl">
                <UserCircle size={16} className="text-indigo-400" />
                <span className="text-xs text-slate-400 font-mono">{userEmail || "Usuario"}</span>
              </div>
              
              <button 
                onClick={logout} 
                className="flex items-center gap-2 px-3 py-2 bg-slate-800/80 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-slate-700/50 rounded-xl transition-all shadow-sm active:scale-95"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline font-bold text-xs">Cerrar Sesión</span>
              </button>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════
          LAYOUT BODY: aside + main
          ═══════════════════════════════════════ */}
      <div className="flex flex-1 relative">

        {/* ASIDE — visible cuando aside abierto */}
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.aside
              key="aside"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 260, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="bg-slate-900/80 backdrop-blur-xl border-r border-slate-800/80 flex flex-col justify-between overflow-hidden z-40 sticky top-0 h-screen flex-shrink-0"
            >
              {/* Aside Header */}
              <div>
                <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-lg overflow-hidden">
                      <img src={logo} alt="Imopex Logo" className="w-[80%] h-[80%] object-contain" />
                    </div>
                    <span className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight">
                      Imopex
                    </span>
                  </div>
                  {/* Botón cerrar aside */}
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-slate-800 rounded-xl transition text-slate-400 hover:text-white"
                    title="Cerrar menú"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Nav Links */}
                <div className="p-4 space-y-2">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-3 mb-4">Navegación</p>
                  
                  <nav className="space-y-1">
                    {menuItems.map((item) => {
                      const isActive = location.pathname.startsWith(item.path);
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={`flex items-center justify-between px-3 py-3 rounded-xl transition-all group ${
                            isActive 
                              ? "bg-gradient-to-r from-indigo-500/10 to-indigo-500/5 text-indigo-400 font-bold border-l-4 border-indigo-500 shadow-sm" 
                              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon size={18} className={isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300 transition-colors"} />
                            <span className="text-sm tracking-wide">{item.label}</span>
                          </div>
                          {isActive && <ChevronRight size={14} className="text-indigo-400" />}
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              </div>

              {/* Aside Footer: usuario + cerrar sesión */}
              <div className="p-4 border-t border-slate-800/50 bg-slate-950/20 space-y-3">
                <div className="flex items-center gap-2 bg-slate-950/40 border border-slate-800/80 py-2 px-3 rounded-xl">
                  <UserCircle size={16} className="text-indigo-400 flex-shrink-0" />
                  <span className="text-xs text-slate-400 font-mono truncate">{userEmail || "Usuario"}</span>
                </div>
                <button 
                  onClick={logout} 
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-800/80 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-slate-700/50 rounded-xl transition-all active:scale-95"
                >
                  <LogOut size={16} />
                  <span className="font-bold text-xs">Cerrar Sesión</span>
                </button>
                <p className="text-[10px] text-slate-600 font-mono text-center">Imopex Dashboard v2.0</p>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-x-hidden min-w-0 bg-[#0f172a]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
