import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { History, Calendar, User, Wrench, ChevronLeft, Search, RefreshCcw, AlertCircle, Plus } from "lucide-react";
import { motion } from "framer-motion";
import api from "../api";

export default function Mantenimientos() {
  const [mantenimientos, setMantenimientos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [error, setError] = useState(null);

  const cargar = async () => {
    setCargando(true);
    setError(null);
    try {
      const res = await api.get("/mantenimiento");
      if (Array.isArray(res)) {
        setMantenimientos(res);
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

  useEffect(() => {
    cargar();
  }, []);

  const filtrados = mantenimientos.filter(m => 
    String(m.maquina_codigo || "").toLowerCase().includes(busqueda.toLowerCase()) ||
    String(m.descripcion || "").toLowerCase().includes(busqueda.toLowerCase()) ||
    m.responsables?.some(r => r.toLowerCase().includes(busqueda.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="p-2 bg-white rounded-2xl shadow-sm border border-slate-100 hover:text-blue-600 transition group">
              <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-xl text-white">
                  <History size={24} />
                </div>
                Historial de Mantenimientos
              </h1>
              <p className="text-slate-500 text-sm mt-1">Registro detallado de intervenciones técnicas en campo</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar por código, descripción o técnico..." 
                className="w-full pl-10 pr-4 py-2.5 bg-white border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition text-sm shadow-sm"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <button 
              onClick={cargar}
              className="p-2.5 bg-white text-slate-600 rounded-2xl shadow-sm border border-slate-100 hover:text-blue-600 transition flex items-center gap-2"
              title="Recargar datos"
            >
              <RefreshCcw size={18} className={cargando ? "animate-spin" : ""} />
            </button>
            <Link 
              to="/dashboard"
              className="px-5 py-2.5 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition flex items-center gap-2 text-sm"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Nueva Intervención</span>
            </Link>
          </div>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl flex items-center gap-3 text-sm font-medium"
          >
            <AlertCircle size={20} />
            {error}
          </motion.div>
        )}

        <div className="grid grid-cols-1 gap-4">
          {cargando ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-400 font-medium animate-pulse">Cargando historial...</p>
            </div>
          ) : filtrados.length > 0 ? (
            filtrados.map((m, i) => (
              <motion.div 
                key={m.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all group"
              >
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 rounded-xl transition-colors">
                        <Wrench size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-900 leading-none mb-1">Máquina {m.maquina_codigo}</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID: {String(m.id).slice(0, 8)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 text-sm font-medium bg-slate-50 px-3 py-1.5 rounded-xl">
                      <Calendar size={16} className="text-blue-500" />
                      {new Date(m.fecha).toLocaleDateString(undefined, { day: '2-digit', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-full" />
                    <p className="text-slate-600 text-sm leading-relaxed pl-4">
                      {m.descripcion}
                    </p>
                  </div>
                </div>
                <div className="md:w-64 flex flex-col justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 space-y-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Técnicos Asignados</span>
                  <div className="flex flex-wrap gap-2">
                    {m.responsables && m.responsables.length > 0 ? (
                      m.responsables.map((resp, j) => (
                        <span key={j} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-700 rounded-xl text-xs font-bold border border-slate-100 group-hover:border-blue-100 group-hover:bg-blue-50/50 transition-colors">
                          <User size={12} className="text-blue-500" />
                          {resp}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">Sin técnicos asignados</span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="text-center py-24 bg-white rounded-[2rem] border-2 border-dashed border-slate-100 text-slate-400"
            >
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <History size={40} strokeWidth={1} className="text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No hay mantenimientos</h3>
              <p className="text-slate-500 max-w-xs mx-auto text-sm">Aún no se han registrado intervenciones técnicas. Puedes crear una desde el Dashboard seleccionando una máquina.</p>
              <Link to="/dashboard" className="inline-block mt-6 px-6 py-2.5 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition">
                Ir al Dashboard
              </Link>
            </motion.div>
          )}
        </div>
      </div>
      <p className="text-center mt-12 text-slate-400 text-xs">© 2024 Imopex Cloud • Panel de Mantenimiento</p>
    </div>
  );
}

