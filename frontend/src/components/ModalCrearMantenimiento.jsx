import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wrench, Search, Calendar, User, ClipboardList, Check, Plus } from "lucide-react";
import api from "../api";
import { useAlert } from "../context/AlertContext";

export default function ModalCrearMantenimiento({ onClose, onCreated }) {
  const { showAlert } = useAlert();
  const [maquinas, setMaquinas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [busquedaMaquina, setBusquedaMaquina] = useState("");
  const [busquedaTecnico, setBusquedaTecnico] = useState("");
  const [maquinaSeleccionada, setMaquinaSeleccionada] = useState(null);
  const [tecnicosSeleccionados, setTecnicosSeleccionados] = useState([]);
  
  const [formData, setFormData] = useState({
    descripcion: "",
    fecha: new Date().toISOString().split("T")[0]
  });
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [resMaq, resUser] = await Promise.all([
          api.get("/maquinas"),
          api.get("/usuarios")
        ]);
        setMaquinas(resMaq || []);
        setUsuarios(resUser || []);
      } catch (err) {
        console.error("Error cargando datos:", err);
      }
    };
    cargarDatos();
  }, []);

  const maquinasFiltradas = maquinas.filter(m => 
    m.codigo.toLowerCase().includes(busquedaMaquina.toLowerCase()) ||
    m.serial_maquina?.toLowerCase().includes(busquedaMaquina.toLowerCase())
  ).slice(0, 5);

  const usuariosFiltrados = usuarios.filter(u => 
    u.nombre.toLowerCase().includes(busquedaTecnico.toLowerCase()) &&
    !tecnicosSeleccionados.find(t => t.id === u.id)
  ).slice(0, 5);

  const toggleTecnico = (u) => {
    if (tecnicosSeleccionados.find(t => t.id === u.id)) {
      setTecnicosSeleccionados(tecnicosSeleccionados.filter(t => t.id !== u.id));
    } else {
      setTecnicosSeleccionados([...tecnicosSeleccionados, u]);
      setBusquedaTecnico("");
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!maquinaSeleccionada) return showAlert("Por favor, selecciona una máquina", "warning");
    if (tecnicosSeleccionados.length === 0) return showAlert("Por favor, selecciona al menos un técnico", "warning");
    
    // Objeto optimista para renderizado instantáneo
    const nuevoMantenimiento = {
      id: Math.random().toString(), // Temporal hasta recarga real de fondo
      maquina_codigo: maquinaSeleccionada.codigo,
      descripcion: formData.descripcion.trim(),
      responsables: tecnicosSeleccionados.map(t => t.nombre),
      fecha: formData.fecha
    };

    // Actualización local inmediata (0ms latencia)
    onCreated(nuevoMantenimiento);
    onClose();

    try {
      await api.post("/mantenimiento", {
        descripcion: formData.descripcion.trim(),
        maquinas_id: maquinaSeleccionada.id,
        usuarios_id: tecnicosSeleccionados.map(t => t.id),
        fecha: formData.fecha
      });
      showAlert("Mantenimiento registrado con éxito ✅", "success");
    } catch (err) {
      console.error(err);
      showAlert("Error al registrar el mantenimiento en el servidor", "error");
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-[2rem] shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/20">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-xl text-white shadow-md shadow-indigo-500/25">
              <Wrench size={20} />
            </div>
            <span>Nueva Intervención</span>
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-all">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* SELECCIÓN DE MÁQUINA */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">1. Máquina a Intervenir</label>
            {!maquinaSeleccionada ? (
              <div className="relative group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={16} />
                <input 
                  type="text" 
                  placeholder="Escribe el código de la máquina..." 
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/40 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                  value={busquedaMaquina}
                  onChange={(e) => setBusquedaMaquina(e.target.value)}
                />
                {busquedaMaquina && (
                  <div className="absolute z-50 w-full mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
                    {maquinasFiltradas.map(m => (
                      <button 
                        key={m.id}
                        type="button"
                        onClick={() => { setMaquinaSeleccionada(m); setBusquedaMaquina(""); }}
                        className="w-full text-left px-4 py-3 hover:bg-slate-800 text-sm text-slate-200 border-b border-slate-800/80 last:border-0 flex justify-between items-center group/item"
                      >
                        <div className="flex flex-col">
                          <span className="font-bold group-hover/item:text-indigo-400 transition-colors">{m.codigo}</span>
                          <span className="text-[10px] text-slate-500 font-bold uppercase">{m.localidad}</span>
                        </div>
                        <Check size={16} className="text-slate-600 group-hover/item:text-indigo-400" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl shadow-inner">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400">
                    <Check size={18} />
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-white leading-tight">{maquinaSeleccionada.codigo}</span>
                    <span className="block text-[10px] text-slate-500 font-semibold uppercase">{maquinaSeleccionada.localidad}</span>
                  </div>
                </div>
                <button type="button" onClick={() => setMaquinaSeleccionada(null)} className="p-2 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-all rounded-lg">
                  <X size={16}/>
                </button>
              </div>
            )}
          </div>

          {/* SELECCIÓN DE TÉCNICOS (MULTIPLE) */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">2. Técnicos Responsables</label>
            
            <div className="flex flex-wrap gap-2 mb-2">
              <AnimatePresence>
                {tecnicosSeleccionados.map(t => (
                  <motion.span 
                    initial={{ scale: 0.8, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    key={t.id} 
                    className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 rounded-xl text-xs font-bold uppercase tracking-wide"
                  >
                    <User size={12} className="text-indigo-400" />
                    {t.nombre}
                    <button type="button" onClick={() => toggleTecnico(t)} className="hover:text-rose-400 text-slate-500 transition-colors">
                      <X size={14} />
                    </button>
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>

            <div className="relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Buscar técnico por nombre..." 
                className="w-full pl-10 pr-4 py-3 bg-slate-950/40 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                value={busquedaTecnico}
                onChange={(e) => setBusquedaTecnico(e.target.value)}
              />
              {busquedaTecnico && (
                <div className="absolute z-50 w-full mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
                  {usuariosFiltrados.map(u => (
                    <button 
                      key={u.id}
                      type="button"
                      onClick={() => toggleTecnico(u)}
                      className="w-full text-left px-4 py-3 hover:bg-slate-800 text-sm text-slate-200 border-b border-slate-800/80 last:border-0 flex justify-between items-center group/user"
                    >
                      <span className="font-bold group-hover/user:text-indigo-400 transition-colors">{u.nombre}</span>
                      <Plus size={16} className="text-slate-600 group-hover/user:text-indigo-400" />
                    </button>
                  ))}
                  {usuariosFiltrados.length === 0 && (
                    <div className="p-3 text-center text-[10px] text-slate-500 uppercase font-bold">No se encontraron más técnicos</div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-1.5">
                <Calendar size={13} className="text-indigo-400" />
                <span>3. Fecha</span>
              </label>
              <input 
                type="date"
                required
                className="w-full p-3 bg-slate-950/40 border border-slate-800 rounded-xl text-sm text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none font-bold"
                value={formData.fecha}
                onChange={(e) => setFormData({...formData, fecha: e.target.value})}
              />
            </div>
            <div className="flex items-end">
               <div className="w-full py-3 px-4 bg-slate-950/20 border border-dashed border-slate-800 rounded-xl flex items-center justify-center gap-2">
                  <ClipboardList size={15} className="text-slate-600" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Reporte Técnico</span>
               </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">4. Descripción de la Intervención</label>
            <textarea 
              required
              rows="3"
              placeholder="Detalla el trabajo realizado, repuestos cambiados, etc..."
              className="w-full p-4 bg-slate-950/40 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none min-h-[90px]"
              value={formData.descripcion}
              onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700/80 text-slate-300 rounded-xl font-bold transition active:scale-[0.98]">
              Cancelar
            </button>
            <button 
              disabled={enviando}
              type="submit" 
              className="flex-1 py-3.5 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 hover:-translate-y-0.5 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none uppercase tracking-wider text-xs"
            >
              {enviando ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span>Guardar Intervención</span>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
