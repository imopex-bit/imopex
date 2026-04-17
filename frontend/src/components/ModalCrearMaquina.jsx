import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Activity, MapPin, Type, Save, Tag, Hash } from "lucide-react";
import api from "../api";

export default function ModalCrearMaquina({ onClose, onCreated }) {
  const [codigo, setCodigo] = useState("");
  const [serialMaquina, setSerialMaquina] = useState("");
  const [serialBilletero, setSerialBilletero] = useState("");
  const [estado, setEstado] = useState("");
  const [tipos, setTipos] = useState([]);
  const [tipo, setTipo] = useState("");
  const [nuevoTipo, setNuevoTipo] = useState("");
  const [mostrarNuevoTipo, setMostrarNuevoTipo] = useState(false);
  const [localidades, setLocalidades] = useState([]);
  const [localidad, setLocalidad] = useState("");
  const [nuevaLocalidad, setNuevaLocalidad] = useState("");
  const [mostrarNuevaLocalidad, setMostrarNuevaLocalidad] = useState(false);
  const [descripcion, setDescripcion] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await api.get("/maquinas");
        if (Array.isArray(data)) {
          setTipos([...new Set(data.map(m => m.tipo_maquina))].filter(Boolean));
          setLocalidades([...new Set(data.map(m => m.localidad))].filter(Boolean));
        }
      } catch (err) {
        console.error(err);
      }
    };
    cargar();
  }, []);

  const guardar = async () => {
    const tipoFinal = mostrarNuevoTipo ? nuevoTipo.trim() : tipo;
    const localidadFinal = mostrarNuevaLocalidad ? nuevaLocalidad.trim() : localidad;

    if (!codigo || !serialMaquina || !serialBilletero || !tipoFinal || !estado || !localidadFinal) {
      return;
    }

    try {
      setLoading(true);
      await api.post("/maquinas", {
        codigo,
        serial_maquina: serialMaquina,
        serial_billetero: serialBilletero,
        tipo_maquina: tipoFinal,
        estado,
        localidad: localidadFinal,
        descripcion
      });
      onCreated();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl text-white">
              <Plus size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Nueva Máquina</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition text-slate-400">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Código Identificador</label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  placeholder="Ej. MAQ-001"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition text-sm"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Tipo de Máquina</label>
              <div className="relative">
                <Type className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <select 
                  value={tipo}
                  onChange={(e) => { setTipo(e.target.value); setMostrarNuevoTipo(false); }}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition text-sm appearance-none"
                >
                  <option value="">Seleccionar</option>
                  {tipos.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <button onClick={() => setMostrarNuevoTipo(!mostrarNuevoTipo)} className="text-blue-600 text-[10px] font-bold mt-1 ml-1 hover:underline">
                {mostrarNuevoTipo ? "✖ Usar lista" : "➕ Crear nuevo tipo"}
              </button>
              {mostrarNuevoTipo && (
                <input 
                  placeholder="Nombre del nuevo tipo..."
                  value={nuevoTipo}
                  onChange={(e) => setNuevoTipo(e.target.value)}
                  className="w-full mt-2 p-3 bg-blue-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition text-sm"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Serial Máquina</label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  placeholder="S/N 123456"
                  value={serialMaquina}
                  onChange={(e) => setSerialMaquina(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition text-sm"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Serial Billetero</label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  placeholder="B/L 987654"
                  value={serialBilletero}
                  onChange={(e) => setSerialBilletero(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition text-sm"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Estado Inicial</label>
              <div className="relative">
                <Activity className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <select 
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition text-sm appearance-none"
                >
                  <option value="">Seleccionar</option>
                  <option value="funcional">Funcional</option>
                  <option value="no funcional">No Funcional</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Ubicación</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <select 
                  value={localidad}
                  onChange={(e) => { setLocalidad(e.target.value); setMostrarNuevaLocalidad(false); }}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition text-sm appearance-none"
                >
                  <option value="">Seleccionar</option>
                  {localidades.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <button onClick={() => setMostrarNuevaLocalidad(!mostrarNuevaLocalidad)} className="text-blue-600 text-[10px] font-bold mt-1 ml-1 hover:underline">
                {mostrarNuevaLocalidad ? "✖ Usar lista" : "➕ Nueva ubicación"}
              </button>
              {mostrarNuevaLocalidad && (
                <input 
                  placeholder="Escriba la nueva ubicación..."
                  value={nuevaLocalidad}
                  onChange={(e) => setNuevaLocalidad(e.target.value)}
                  className="w-full mt-2 p-3 bg-blue-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition text-sm"
                />
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Descripción / Observaciones</label>
            <textarea 
              placeholder="Detalles adicionales sobre la máquina..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full p-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition text-sm min-h-[80px]"
            />
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 flex gap-3 bg-slate-50/30">
          <button onClick={onClose} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition">
            Cancelar
          </button>
          <button 
            onClick={guardar}
            disabled={loading}
            className="flex-1 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition flex items-center justify-center gap-2"
          >
            {loading ? "Creando..." : (
              <>
                <Save size={18} />
                Crear Máquina
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}