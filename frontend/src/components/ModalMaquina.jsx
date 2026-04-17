import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wrench, User, Calendar, Trash2, AlertCircle, Save, Plus, History } from "lucide-react";
import api from "../api";

export default function ModalMaquina({ maquina, onClose }) {
  const [detalle, setDetalle] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [descripcion, setDescripcion] = useState("");
  const [tecnicosSeleccionados, setTecnicosSeleccionados] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtrados, setFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);

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
    if (!window.confirm("¿Eliminar mantenimiento?")) return;
    try {
      await api.delete(`/mantenimiento/${id}`);
      await cargarDetalle();
    } catch (error) {
      console.log("ERROR ELIMINANDO:", error);
    }
  };

  const eliminarMaquina = async () => {
    try {
      await api.delete(`/maquinas/${maquina.id}`);
      onClose();
      window.location.reload();
    } catch (error) {
      console.log("ERROR ELIMINANDO MAQUINA:", error);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl text-white">
              <Wrench size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Máquina {maquina.codigo}</h2>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{maquina.tipo_maquina}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition text-slate-400">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Status & Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Estado Actual</span>
              <div className="flex items-center gap-2 mt-1">
                <span className={`w-2 h-2 rounded-full ${maquina.estado === "funcional" ? "bg-emerald-500" : "bg-rose-500"}`} />
                <span className="font-bold text-slate-700 capitalize">{maquina.estado}</span>
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Localidad</span>
              <p className="font-bold text-slate-700 mt-1">{maquina.localidad}</p>
            </div>
          </div>

          {/* History */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <History size={18} className="text-blue-600" />
              Historial de Intervenciones
            </h3>
            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-8 text-slate-400 italic">Cargando historial...</div>
              ) : !detalle?.mantenimientos?.length ? (
                <div className="text-center py-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 text-sm">
                  No hay registros previos
                </div>
              ) : (
                detalle.mantenimientos.map(m => (
                  <div key={m.id} className="p-4 bg-white border border-slate-100 rounded-2xl hover:shadow-md transition group">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold text-blue-600 flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(m.fecha).toLocaleDateString()}
                      </span>
                      <button onClick={() => eliminarMantenimiento(m.id)} className="opacity-0 group-hover:opacity-100 p-1 text-rose-400 hover:text-rose-600 transition">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <p className="text-sm text-slate-600 mb-3 italic">"{m.descripcion}"</p>
                    <div className="flex flex-wrap gap-2">
                      {m.usuarios?.map((u, i) => (
                        <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[10px] font-medium flex items-center gap-1">
                          <User size={10} /> {u}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* New Maintenance Form */}
          <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 space-y-4">
            <h3 className="font-bold text-blue-900 flex items-center gap-2">
              <Plus size={18} />
              Registrar Nuevo Mantenimiento
            </h3>
            <div className="space-y-3">
              <textarea
                placeholder="Describa la intervención técnica..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="w-full bg-white border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500 min-h-[100px] shadow-sm shadow-blue-100"
              />
              
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar técnico responsable..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full bg-white border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 shadow-sm shadow-blue-100"
                />
                <AnimatePresence>
                  {filtrados.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 bg-white shadow-xl rounded-xl border border-slate-100 mt-2 z-10 max-h-40 overflow-y-auto"
                    >
                      {filtrados.map(u => (
                        <div key={u.id} onClick={() => seleccionarTecnico(u.id)} className="p-3 hover:bg-blue-50 cursor-pointer text-sm text-slate-600 transition">
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
                      className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-bold cursor-pointer hover:bg-rose-500 transition flex items-center gap-2"
                    >
                      {user?.nombre} <X size={12} />
                    </motion.span>
                  );
                })}
              </div>

              <button
                onClick={guardar}
                className="w-full bg-blue-600 text-white py-3 rounded-2xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
              >
                <Save size={18} />
                Guardar Reporte
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 flex justify-between items-center bg-slate-50/50">
          <button 
            onClick={() => setConfirmDelete(true)}
            className="text-rose-500 hover:text-rose-700 text-sm font-bold flex items-center gap-2 transition"
          >
            <Trash2 size={16} />
            Eliminar Máquina
          </button>
          <button onClick={onClose} className="px-6 py-2 bg-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-300 transition text-sm">
            Cerrar
          </button>
        </div>
      </motion.div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[110] p-4"
          >
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center"
            >
              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle size={32} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">¿Confirmar Eliminación?</h2>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                Esta acción eliminará permanentemente la máquina <span className="font-bold">{maquina.codigo}</span> y todo su historial.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(false)} className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-2xl font-bold">Cancelar</button>
                <button onClick={eliminarMaquina} className="flex-1 px-4 py-3 bg-rose-600 text-white rounded-2xl font-bold shadow-lg shadow-rose-200">Eliminar</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}