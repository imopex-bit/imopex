import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wrench, User, Calendar, Trash2, AlertCircle, Save, Plus, History } from "lucide-react";
import api from "../api";
import { useAlert } from "../context/AlertContext";

export default function ModalMaquina({ maquina, onClose }) {
  const { showAlert, showConfirm } = useAlert();
  const [detalle, setDetalle] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [descripcion, setDescripcion] = useState("");
  const [tecnicosSeleccionados, setTecnicosSeleccionados] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtrados, setFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarDetalle = async () => {
    if (!maquina?.id) return;
    try {
      setLoading(true);
      const data = await api.get(`/maquinas/${maquina.id}`);
      setDetalle(data || {});
    } catch (error) {
      console.log("ERROR DETALLE:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDetalle();
  }, [maquina]);

  useEffect(() => {
    const cargarUsuarios = async () => {
      try {
        const data = await api.get("/usuarios");
        setUsuarios(data || []);
      } catch (error) {
        console.log("ERROR USUARIOS:", error);
      }
    };
    cargarUsuarios();
  }, []);

  useEffect(() => {
    if (!busqueda) {
      setFiltrados([]);
      return;
    }
    const f = usuarios.filter(u =>
      u.nombre?.toLowerCase().includes(busqueda.toLowerCase())
    );
    setFiltrados(f);
  }, [busqueda, usuarios]);

  const seleccionarTecnico = (id) => {
    setTecnicosSeleccionados(prev => prev.includes(id) ? prev : [...prev, id]);
    setBusqueda("");
  };

  const quitarTecnico = (id) => {
    setTecnicosSeleccionados(prev => prev.filter(t => t !== id));
  };

  const guardar = async () => {
    if (!descripcion.trim() || tecnicosSeleccionados.length === 0) return;
    try {
      await api.post("/mantenimiento", {
        descripcion: descripcion.trim(),
        maquinas_id: maquina.id,
        usuarios_id: tecnicosSeleccionados
      });
      setDescripcion("");
      setTecnicosSeleccionados([]);
      await cargarDetalle();
    } catch (error) {
      console.log("ERROR GUARDANDO:", error);
    }
  };

  const eliminarMantenimiento = async (id) => {
    const isConfirmed = await showConfirm("¿Eliminar mantenimiento?");
    if (!isConfirmed) return;
    try {
      await api.delete(`/mantenimiento/${id}`);
      await cargarDetalle();
      showAlert("Mantenimiento eliminado", "success");
    } catch (error) {
      console.log("ERROR ELIMINANDO:", error);
      showAlert("Error al eliminar", "error");
    }
  };

  const handleEliminarMaquinaClick = async () => {
    const isConfirmed = await showConfirm(
      `Esta acción eliminará permanentemente la máquina ${maquina.codigo} y todo su historial.`,
      "¿Confirmar Eliminación?"
    );
    if (!isConfirmed) return;
    try {
      await api.delete(`/maquinas/${maquina.id}`);
      onClose();
      window.location.reload();
    } catch (error) {
      console.log("ERROR ELIMINANDO MAQUINA:", error);
      showAlert("Error al eliminar la máquina", "error");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center z-[200] p-4"
    >
      <motion.div 
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-xl text-white shadow-md shadow-indigo-500/25">
              <Wrench size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Máquina {maquina?.codigo}</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{maquina?.tipo_maquina}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 min-h-0">
          {/* Status & Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-950/40 border border-slate-800/80 p-4 rounded-xl shadow-inner">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estado Actual</span>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${maquina?.estado === "funcional" ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                <span className="font-bold text-slate-100 capitalize text-sm">{maquina?.estado}</span>
              </div>
            </div>
            <div className="bg-slate-950/40 border border-slate-800/80 p-4 rounded-xl shadow-inner">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Localidad</span>
              <p className="font-bold text-slate-100 mt-1.5 text-sm">{maquina?.localidad}</p>
            </div>
            <div className="bg-slate-950/40 border border-slate-800/80 p-4 rounded-xl shadow-inner">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Operador Asignado</span>
              <p className="font-bold text-indigo-300 mt-1.5 text-sm">
                {(() => {
                  try {
                    const cachedOps = JSON.parse(localStorage.getItem("cache_maquinas_operadores")) || {};
                    return cachedOps[maquina.id] || cachedOps[maquina.codigo] || "Sin asignar";
                  } catch {
                    return "Sin asignar";
                  }
                })()}
              </p>
            </div>
          </div>

          {/* History */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-200 flex items-center gap-2 text-sm uppercase tracking-wide">
              <History size={16} className="text-indigo-400" />
              <span>Historial de Intervenciones</span>
            </h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {loading ? (
                <div className="text-center py-8 text-slate-500 italic text-sm">Cargando historial...</div>
              ) : !detalle?.mantenimientos?.length ? (
                <div className="text-center py-8 bg-slate-950/20 rounded-xl border border-dashed border-slate-800 text-slate-500 text-xs uppercase font-bold tracking-wider">
                  No hay registros previos
                </div>
              ) : (
                detalle.mantenimientos.map(m => (
                  <div key={m.id} className="p-4 bg-slate-950/30 border border-slate-800 rounded-xl hover:border-slate-700/60 transition group">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold text-indigo-400 flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(m.fecha).toLocaleDateString()}
                      </span>
                      <button onClick={() => eliminarMantenimiento(m.id)} className="opacity-0 group-hover:opacity-100 p-1 text-rose-400 hover:text-rose-500 transition rounded hover:bg-slate-800">
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <p className="text-sm text-slate-300 mb-3 italic">"{m.descripcion}"</p>
                    <div className="flex flex-wrap gap-1.5">
                      {m.usuarios?.map((u, i) => (
                        <span key={i} className="px-2 py-1 bg-slate-800/80 text-slate-300 border border-slate-700/50 rounded-lg text-[10px] font-semibold flex items-center gap-1 uppercase tracking-wide">
                          <User size={10} className="text-slate-400" /> {u}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* New Maintenance Form */}
          <div className="bg-slate-950/25 p-5 rounded-2xl border border-indigo-500/20 space-y-4">
            <h3 className="font-bold text-indigo-300 flex items-center gap-2 text-sm uppercase tracking-wider">
              <Plus size={16} />
              <span>Registrar Nuevo Mantenimiento</span>
            </h3>
            <div className="space-y-3">
              <textarea
                placeholder="Describa la intervención técnica..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-slate-100 placeholder:text-slate-600 rounded-xl p-3.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none min-h-[80px]"
              />
              
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar técnico responsable..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 placeholder:text-slate-600 rounded-xl p-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                />
                <AnimatePresence>
                  {filtrados.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 bg-slate-900 border border-slate-800 shadow-2xl rounded-xl mt-2 z-10 max-h-40 overflow-y-auto"
                    >
                      {filtrados.map(u => (
                        <div key={u.id} onClick={() => seleccionarTecnico(u.id)} className="p-3 hover:bg-slate-800 cursor-pointer text-sm text-slate-300 transition border-b border-slate-800/80 last:border-0">
                          {u.nombre}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex flex-wrap gap-2">
                {tecnicosSeleccionados.map(id => {
                  const user = usuarios.find(u => u.id === id);
                  return (
                    <motion.span 
                      key={id} 
                      layout
                      onClick={() => quitarTecnico(id)}
                      className="px-3 py-1.5 bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 rounded-xl text-xs font-bold cursor-pointer hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20 transition-all flex items-center gap-1.5"
                    >
                      <span>{user?.nombre}</span> <X size={12} />
                    </motion.span>
                  );
                })}
              </div>

              <button
                onClick={guardar}
                className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-white py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-indigo-500/20 hover:-translate-y-0.5 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Save size={18} />
                <span>Guardar Reporte</span>
              </button>
            </div>
          </div>
        </div>
        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-slate-800 flex justify-between items-center bg-slate-950/20 shrink-0">
          <button 
            onClick={handleEliminarMaquinaClick}
            className="text-rose-400 hover:text-rose-500 text-sm font-bold flex items-center gap-2 transition hover:underline"
          >
            <Trash2 size={16} />
            <span>Eliminar Máquina</span>
          </button>
          <button onClick={onClose} className="px-6 py-2.5 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700/80 transition text-sm active:scale-[0.98]">
            Cerrar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}