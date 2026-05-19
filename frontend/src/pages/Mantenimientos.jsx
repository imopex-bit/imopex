import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { History, Calendar, User, Wrench, ChevronLeft, ChevronRight, Search, RefreshCcw, AlertCircle, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api";
import ModalCrearMantenimiento from "../components/ModalCrearMantenimiento";

export default function Mantenimientos() {
  const [mantenimientos, setMantenimientos] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cache_mantenimientos")) || [];
    } catch {
      return [];
    }
  });
  const [cargando, setCargando] = useState(() => {
    try {
      const cache = localStorage.getItem("cache_mantenimientos");
      return !cache;
    } catch {
      return true;
    }
  });
  const [busqueda, setBusqueda] = useState("");
  const [error, setError] = useState(null);
  const [showCrearModal, setShowCrearModal] = useState(false);

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 8;

  const cargar = async () => {
    setCargando(mantenimientos.length === 0);
    setError(null);
    try {
      const res = await api.get("/mantenimiento");
      if (Array.isArray(res)) {
        setMantenimientos(res);
        localStorage.setItem("cache_mantenimientos", JSON.stringify(res));
      } else {
        throw new Error("Respuesta inválida del servidor");
      }
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los mantenimientos. Verifica la conexión con la base de datos.");
    } finally {
      setCargando(false);
    }
  };

  const agregarMantenimientoLocal = (nuevoMant) => {
    setMantenimientos(prev => {
      const nuevas = [nuevoMant, ...prev];
      localStorage.setItem("cache_mantenimientos", JSON.stringify(nuevas));
      return nuevas;
    });
    cargar(); // Recarga de fondo silenciosa para sincronizar con la base de datos
  };

  useEffect(() => {
    cargar();
  }, []);

  const filtrados = useMemo(() => {
    return mantenimientos.filter(m => 
      String(m.maquina_codigo || "").toLowerCase().includes(busqueda.toLowerCase()) ||
      String(m.descripcion || "").toLowerCase().includes(busqueda.toLowerCase()) ||
      m.responsables?.some(r => r.toLowerCase().includes(busqueda.toLowerCase()))
    );
  }, [mantenimientos, busqueda]);

  const paginados = useMemo(() => {
    const inicio = (paginaActual - 1) * itemsPorPagina;
    return filtrados.slice(inicio, inicio + itemsPorPagina);
  }, [filtrados, paginaActual]);

  const totalPaginas = Math.ceil(filtrados.length / itemsPorPagina);

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans relative overflow-hidden">
      
      {/* Background ambient gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/10 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="relative z-10 h-full flex flex-col">
        <main className="max-w-6xl mx-auto p-4 sm:p-8 space-y-8 flex-1 w-full">
          
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div>

              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-600/20">
                  <History size={24} />
                </div>
                Historial de Mantenimientos
              </h1>
              <p className="text-slate-400 text-sm mt-1">Registro detallado de intervenciones técnicas en campo</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Buscar por código, descripción o técnico..." 
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-2xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm text-white placeholder:text-slate-500 outline-none shadow-sm"
                value={busqueda}
                onChange={(e) => { setBusqueda(e.target.value); setPaginaActual(1); }}
              />
            </div>
            <button 
              onClick={cargar}
              className="p-2.5 bg-slate-800/50 backdrop-blur-md text-slate-400 rounded-2xl shadow-sm border border-slate-700/50 hover:text-blue-400 hover:border-blue-500/50 transition flex items-center gap-2"
              title="Recargar datos"
            >
              <RefreshCcw size={18} className={cargando ? "animate-spin text-blue-400" : ""} />
            </button>
            <button 
              onClick={() => setShowCrearModal(true)}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition flex items-center gap-2 text-sm"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Nueva Intervención</span>
            </button>
          </div>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-2xl flex items-center gap-3 text-sm font-bold shadow-lg shadow-rose-500/5"
          >
            <AlertCircle size={20} />
            {error}
          </motion.div>
        )}

        <div className="grid grid-cols-1 gap-4">
          {cargando ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin shadow-lg shadow-blue-500/20" />
              <p className="text-slate-400 font-bold animate-pulse tracking-wide">Cargando historial...</p>
            </div>
          ) : paginados.length > 0 ? (
            paginados.map((m, i) => (
              <motion.div 
                key={m.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i, 4) * 0.04 }}
                className="bg-slate-800/40 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-slate-700/50 flex flex-col md:flex-row gap-6 hover:bg-slate-800/60 hover:border-blue-500/30 transition-all group"
              >
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-slate-900/50 text-slate-400 group-hover:bg-blue-500/10 group-hover:text-blue-400 group-hover:border-blue-500/20 border border-slate-700/50 rounded-xl transition-all shadow-inner">
                        <Wrench size={20} />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-lg text-white leading-none mb-1">Máquina {m.maquina_codigo}</h3>
                        <div className="flex flex-col gap-0.5">
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono">S/N: {m.serial_maquina}</p>
                          <div className="flex gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono">
                            {!m.serial_billetero_2 ? (
                              <span>Billetero: {m.serial_billetero_1 || m.serial_billetero || "N/A"}</span>
                            ) : (
                              <>
                                <span>B1: {m.serial_billetero_1 || m.serial_billetero || "N/A"}</span>
                                <span>B2: {m.serial_billetero_2}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300 text-sm font-bold bg-slate-900/50 border border-slate-700/50 px-3 py-1.5 rounded-xl shadow-inner">
                      <Calendar size={16} className="text-blue-400" />
                      {new Date(m.fecha).toLocaleDateString(undefined, { day: '2-digit', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                    <p className="text-slate-300 text-sm leading-relaxed pl-4 font-medium">
                      {m.descripcion}
                    </p>
                  </div>
                </div>
                <div className="md:w-64 flex flex-col justify-center border-t md:border-t-0 md:border-l border-slate-700/50 pt-4 md:pt-0 md:pl-6 space-y-3">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Técnicos Asignados</span>
                  <div className="flex flex-wrap gap-2">
                    {m.responsables && m.responsables.length > 0 ? (
                      m.responsables.map((resp, j) => (
                        <span key={j} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/50 text-slate-300 rounded-xl text-xs font-bold border border-slate-700/50 group-hover:border-blue-500/20 group-hover:bg-blue-500/10 transition-colors shadow-sm">
                          <User size={12} className="text-blue-400" />
                          {resp}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500 italic">Sin técnicos asignados</span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="text-center py-24 bg-slate-800/20 backdrop-blur-sm rounded-[2rem] border-2 border-dashed border-slate-700/50 text-slate-500"
            >
              <div className="w-20 h-20 bg-slate-900/50 border border-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <History size={40} strokeWidth={1} className="text-slate-600" />
              </div>
              <h3 className="text-xl font-extrabold text-white mb-2">No hay mantenimientos</h3>
              <p className="text-slate-400 max-w-xs mx-auto text-sm">Aún no se han registrado intervenciones técnicas. Puedes crear una desde el Dashboard seleccionando una máquina.</p>
              <Link to="/dashboard" className="inline-block mt-6 px-6 py-2.5 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition">
                Ir al Dashboard
              </Link>
            </motion.div>
          )}

          {/* PAGINATION */}
          {filtrados.length > itemsPorPagina && (
            <div className="px-6 py-4 bg-slate-800/40 rounded-2xl border border-slate-700/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-slate-400 font-medium tracking-wide">
                Mostrando <span className="text-white font-bold">{paginados.length}</span> de <span className="text-white font-bold">{filtrados.length}</span> registros
              </p>
              <div className="flex items-center gap-1.5">
                <button 
                  disabled={paginaActual === 1}
                  onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                  className="p-2 text-slate-400 hover:text-blue-400 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="flex gap-1">
                  {[...Array(totalPaginas)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPaginaActual(i + 1)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${paginaActual === i + 1 ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30" : "text-slate-400 hover:bg-slate-700 hover:text-white"}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button 
                  disabled={paginaActual === totalPaginas}
                  onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                  className="p-2 text-slate-400 hover:text-blue-400 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </div>
        </main>
      </div>
      <p className="text-center mt-12 mb-4 text-slate-500 text-xs relative z-10 font-bold tracking-wide">© {new Date().getFullYear()} Imopex Cloud • Panel de Mantenimiento</p>
      
      <AnimatePresence>
        {showCrearModal && (
          <ModalCrearMantenimiento 
            onClose={() => setShowCrearModal(false)}
            onCreated={agregarMantenimientoLocal}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

