import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Edit3, MapPin, Activity, Save } from "lucide-react";
import api from "../api";

export default function ModalEditarMaquina({ maquina, onClose, onUpdated }) {
  const [estado, setEstado] = useState("");
  const [localidades, setLocalidades] = useState([]);
  const [localidad, setLocalidad] = useState("");
  const [nuevaLocalidad, setNuevaLocalidad] = useState("");
  const [mostrarNuevaLocalidad, setMostrarNuevaLocalidad] = useState(false);
  const [descripcion, setDescripcion] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!maquina) return;
    setEstado(maquina.estado || "");
    setLocalidad(maquina.localidad || "");
    setDescripcion(maquina.descripcion || "");

    const cargarLocalidades = async () => {
      try {
        const data = await api.get("/maquinas");
        if (Array.isArray(data)) {
          setLocalidades([...new Set(data.map(m => m.localidad))].filter(Boolean));
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    cargarLocalidades();
  }, [maquina]);

  const guardar = async () => {
    const finalLocalidad = mostrarNuevaLocalidad ? nuevaLocalidad.trim() : localidad;
    if (!estado || !finalLocalidad) return;

    try {
      await api.put(`/maquinas/${maquina.id}`, {
        estado,
        localidad: finalLocalidad,
        descripcion: descripcion.trim()
      });
      onUpdated();
      onClose();
    } catch (error) {
      console.log(error);
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
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl text-white">
              <Edit3 size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Editar {maquina.codigo}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition text-slate-400">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Estado Operativo</label>
              <div className="relative mt-1">
                <Activity className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <select 
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition text-sm appearance-none"
                >
                  <option value="">Seleccionar estado</option>
                  <option value="funcional">Funcional</option>
                  <option value="no funcional">No Funcional</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Ubicación / Localidad</label>
              <div className="relative mt-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <select 
                  value={localidad}
                  onChange={(e) => {
                    setLocalidad(e.target.value);
                    setMostrarNuevaLocalidad(false);
                  }}
                  disabled={mostrarNuevaLocalidad}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition text-sm appearance-none"
                >
                  <option value="">Seleccionar ubicación</option>
                  {localidades.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <button 
                onClick={() => {
                  setMostrarNuevaLocalidad(!mostrarNuevaLocalidad);
                  if(!mostrarNuevaLocalidad) setLocalidad("");
                }}
                className="text-indigo-600 text-xs font-bold mt-2 ml-1 hover:underline flex items-center gap-1"
              >
                {mostrarNuevaLocalidad ? "✖ Usar lista" : "➕ Nueva ubicación"}
              </button>
              
              <AnimatePresence>
                {mostrarNuevaLocalidad && (
                  <motion.input
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    placeholder="Escriba la nueva ubicación..."
                    value={nuevaLocalidad}
                    onChange={(e) => setNuevaLocalidad(e.target.value)}
                    className="w-full mt-2 p-3 bg-indigo-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 transition text-sm"
                  />
                )}
              </AnimatePresence>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Notas Adicionales</label>
              <textarea 
                placeholder="Detalles sobre el cambio..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="w-full mt-1 p-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition text-sm min-h-[100px]"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button onClick={onClose} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition">
              Cancelar
            </button>
            <button 
              onClick={guardar}
              className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition flex items-center justify-center gap-2"
            >
              <Save size={18} />
              Actualizar
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}