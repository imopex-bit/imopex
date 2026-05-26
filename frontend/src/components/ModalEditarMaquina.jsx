import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Edit3, MapPin, Activity, Save, Plus, Hash, User } from "lucide-react";
import api from "../api";
import { useAlert } from "../context/AlertContext";

export default function ModalEditarMaquina({ maquina, onClose, onUpdated }) {
  const { showAlert } = useAlert();
  const [estado, setEstado] = useState("");
  const [localidades, setLocalidades] = useState([]);
  const [localidad, setLocalidad] = useState("");
  const [nuevaLocalidad, setNuevaLocalidad] = useState("");
  const [mostrarNuevaLocalidad, setMostrarNuevaLocalidad] = useState(false);
  const [descripcion, setDescripcion] = useState("");
  const [serialMaquina, setSerialMaquina] = useState("");
  const [serialBilletero1, setSerialBilletero1] = useState("");
  const [serialBilletero2, setSerialBilletero2] = useState("");
  const [mostrarBilletero2, setMostrarBilletero2] = useState(false);
  const [loading, setLoading] = useState(true);
  const [operadores, setOperadores] = useState([]);
  const [operador, setOperador] = useState("");

  useEffect(() => {
    if (!maquina) return;
    setEstado(maquina.estado || "");
    setLocalidad(maquina.localidad || "");
    setDescripcion(maquina.descripcion || "");
    setSerialMaquina(maquina.serial_maquina || "");
    setSerialBilletero1(maquina.serial_billetero_1 || maquina.serial_billetero || "");
    setSerialBilletero2(maquina.serial_billetero_2 || "");
    setMostrarBilletero2(!!maquina.serial_billetero_2);

    // Inicializar operador actual de la máquina desde localStorage
    try {
      setOperador(maquina.operador || "");
    } catch (e) {
      console.error(e);
    }

    const cargarDatos = async () => {
      try {
        const data = await api.get("/maquinas");
        if (Array.isArray(data)) {
          setLocalidades([...new Set(data.map(m => m.localidad))].filter(Boolean));
        }

        // Cargar operadores DIRECTAMENTE de la BD (fuente de verdad)
        const dbUsers = await api.get("/usuarios").catch(() => []);
        if (Array.isArray(dbUsers)) {
          // Filtrar solo quienes tienen cargo u rol de operador
          const soloOperadores = dbUsers.filter(u =>
            u.cargo === "operador" || u.rol === "operador"
          ).map(u => ({
            id: u.id,
            nombre: u.nombre,
            cargo: "operador"
          }));
          setOperadores(soloOperadores);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, [maquina]);

  const guardar = async () => {
    const finalLocalidad = mostrarNuevaLocalidad ? nuevaLocalidad.trim() : localidad;
    if (!estado || !finalLocalidad) {
      showAlert("El estado y la localidad son obligatorios", "warning");
      return;
    }

    const datosActualizados = {
      ...maquina,
      estado,
      localidad: finalLocalidad,
      descripcion: (descripcion || "").trim(),
      serial_maquina: (serialMaquina || "").trim(),
      serial_billetero_1: (serialBilletero1 || "").trim(),
      serial_billetero_2: mostrarBilletero2 && (serialBilletero2 || "").trim() ? (serialBilletero2 || "").trim() : null,
      operador
    };

    // Actualización instantánea local e inmediato cierre del modal (0ms latencia percibida)
    onUpdated(datosActualizados);
    onClose();

    try {
      await api.put(`/maquinas/${maquina.id}`, datosActualizados);
      showAlert("Máquina actualizada exitosamente", "success");
    } catch (error) {
      console.log(error);
      showAlert("Error al actualizar la máquina en el servidor", "error");
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
        className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-4 sm:p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-xl text-white shadow-md shadow-indigo-500/25">
              <Edit3 size={20} />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Editar {maquina?.codigo}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1 min-h-0">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Serial Máquina</label>
                <div className="relative">
                  <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input 
                    placeholder="S/N 123456"
                    value={serialMaquina}
                    onChange={(e) => setSerialMaquina(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-950/40 border border-slate-800 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-sm text-slate-100 placeholder:text-slate-600 outline-none"
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Serial Billetero 1</label>
                <div className="relative">
                  <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input 
                    placeholder="B/L 987654"
                    value={serialBilletero1}
                    onChange={(e) => setSerialBilletero1(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-950/40 border border-slate-800 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-sm text-slate-100 placeholder:text-slate-600 outline-none"
                  />
                </div>
                
                {!mostrarBilletero2 ? (
                  <button 
                    type="button" 
                    onClick={() => setMostrarBilletero2(true)} 
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 mt-1.5 transition-colors"
                  >
                    <Plus size={14} /> Agregar billetero 2
                  </button>
                ) : (
                  <div className="mt-3 space-y-1.5 animate-fadeIn">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Billetero 2</label>
                      <button 
                        type="button" 
                        onClick={() => { setMostrarBilletero2(false); setSerialBilletero2(""); }} 
                        className="text-[10px] text-rose-400 hover:text-rose-300 font-black uppercase transition-colors"
                      >
                        ✖ Quitar
                      </button>
                    </div>
                    <div className="relative">
                      <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                      <input 
                        placeholder="B/L 987655 (Opcional)"
                        value={serialBilletero2}
                        onChange={(e) => setSerialBilletero2(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-950/40 border border-slate-800 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-sm text-slate-100 placeholder:text-slate-600 outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Estado Operativo</label>
              <div className="relative mt-1">
                <Activity className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <select 
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/40 border border-slate-800 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-sm text-slate-100 outline-none appearance-none cursor-pointer"
                >
                  <option value="" className="bg-slate-900 text-slate-400">Seleccionar estado</option>
                  <option value="funcional" className="bg-slate-900 text-slate-200">Funcional</option>
                  <option value="no funcional" className="bg-slate-900 text-slate-200">No Funcional</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Ubicación / Localidad</label>
              {!mostrarNuevaLocalidad ? (
                <>
                  <div className="relative mt-1">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <select 
                      value={localidad}
                      onChange={(e) => { setLocalidad(e.target.value); }}
                      className="w-full pl-10 pr-4 py-3 bg-slate-950/40 border border-slate-800 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-sm text-slate-100 outline-none appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-slate-900 text-slate-400">Seleccionar ubicación</option>
                      {localidades.map(l => <option key={l} value={l} className="bg-slate-900 text-slate-200">{l}</option>)}
                    </select>
                  </div>
                  <button 
                    type="button"
                    onClick={() => {
                      setMostrarNuevaLocalidad(true);
                      setLocalidad("");
                    }}
                    className="text-indigo-400 hover:text-indigo-300 text-[10px] font-bold mt-1.5 ml-1 hover:underline flex items-center gap-1 transition-colors"
                  >
                    ➕ Nueva ubicación
                  </button>
                </>
              ) : (
                <>
                  <div className="relative mt-1 animate-fadeIn">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input 
                      placeholder="Escriba la nueva ubicación..."
                      value={nuevaLocalidad}
                      onChange={(e) => setNuevaLocalidad(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-indigo-500/30 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-sm text-indigo-300 outline-none"
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={() => {
                      setMostrarNuevaLocalidad(false);
                      setNuevaLocalidad("");
                      // Restauramos localidad original si existía
                      setLocalidad(maquina.localidad || "");
                    }}
                    className="text-rose-400 hover:text-rose-300 text-[10px] font-bold mt-1.5 ml-1 hover:underline flex items-center gap-1 transition-colors"
                  >
                    ✖ Cancelar nueva ubicación
                  </button>
                </>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Operador Responsable</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <select 
                  value={operador}
                  onChange={(e) => setOperador(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/40 border border-slate-800 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-sm text-slate-100 outline-none appearance-none cursor-pointer"
                >
                  <option value="" className="bg-slate-900 text-slate-400">Sin asignar</option>
                  {operadores.map(op => (
                    <option key={op.nombre} value={op.nombre} className="bg-slate-900 text-slate-200">
                      {op.nombre} ({op.cargo === "tecnico" ? "Técnico" : "Operador"})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Notas Adicionales</label>
              <textarea 
                placeholder="Detalles sobre el cambio..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="w-full p-3.5 bg-slate-950/40 border border-slate-800 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-sm text-slate-100 placeholder:text-slate-600 outline-none min-h-[100px] resize-none"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 shrink-0 p-4 sm:p-6 border-t border-slate-800 bg-slate-950/20">
            <button onClick={onClose} className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700/80 text-slate-300 rounded-xl font-bold transition active:scale-[0.98]">
              Cancelar
            </button>
            <button 
              onClick={guardar}
              className="flex-1 py-3.5 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 hover:-translate-y-0.5 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Save size={18} />
              <span>Actualizar</span>
            </button>
        </div>
      </motion.div>
    </motion.div>
  );
}