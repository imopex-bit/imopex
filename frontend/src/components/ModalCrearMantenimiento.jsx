import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wrench, Search, Calendar, User, ClipboardList, Check, Plus } from "lucide-react";
import api from "../api";

export default function ModalCrearMantenimiento({ onClose, onCreated }) {
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

  const agregarALista = () => {
    // Añadir a la lista de movimientos con motivo seleccionado
    setListaMovimientos(prev => [...prev, {
      repuesto_id: currentSelectedRepuesto,
      nombre: currentSelectedRepuestoNombre,
      codigo: currentSelectedRepuestoCodigo,
      cantidad: currentCantidad,
      observacion: currentObservacion,
      motivo: currentMotivo // normal, defectuoso, devolucion
    }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!maquinaSeleccionada) return alert("Por favor, selecciona una máquina");
    if (tecnicosSeleccionados.length === 0) return alert("Por favor, selecciona al menos un técnico");
    
    setEnviando(true);
    try {
      await api.post("/mantenimiento", {
        descripcion: formData.descripcion,
        maquinas_id: maquinaSeleccionada.id,
        usuarios_id: tecnicosSeleccionados.map(t => t.id),
        fecha: formData.fecha
      });
      alert("Mantenimiento registrado con éxito ✅");
      onCreated();
      onClose();
    } catch (err) {
      alert("Error al registrar el mantenimiento");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-slate-800 border border-slate-700 w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
          <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
            <Wrench className="text-blue-500" size={20} />
            Nueva Intervención
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full text-slate-400 transition-all">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[85vh] overflow-y-auto">
          
          {/* SELECCIÓN DE MÁQUINA */}
          <div className="space-y-3">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">1. Máquina a Intervenir</label>
            {!maquinaSeleccionada ? (
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="Escribe el código de la máquina..." 
                  className="w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-slate-700 rounded-2xl text-sm text-white focus:border-blue-500 outline-none transition-all shadow-inner"
                  value={busquedaMaquina}
                  onChange={(e) => setBusquedaMaquina(e.target.value)}
                />
                {busquedaMaquina && (
                  <div className="absolute z-50 w-full mt-2 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden border-t-0">
                    {maquinasFiltradas.map(m => (
                      <button 
                        key={m.id}
                        type="button"
                        onClick={() => { setMaquinaSeleccionada(m); setBusquedaMaquina(""); }}
                        className="w-full text-left px-5 py-4 hover:bg-slate-700 text-sm text-white border-b border-slate-700 last:border-0 flex justify-between items-center group/item"
                      >
                        <div className="flex flex-col">
                          <span className="font-black group-hover/item:text-blue-400 transition-colors">{m.codigo}</span>
                          <span className="text-[10px] text-slate-500 font-bold uppercase">{m.localidad}</span>
                        </div>
                        <Check size={16} className="text-slate-600 group-hover/item:text-blue-400" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-blue-500/10 border border-blue-500/30 rounded-2xl shadow-inner">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400">
                    <Check size={20} />
                  </div>
                  <div>
                    <span className="block text-sm font-black text-white">{maquinaSeleccionada.codigo}</span>
                    <span className="block text-[10px] text-slate-500 font-bold uppercase">{maquinaSeleccionada.localidad}</span>
                  </div>
                </div>
                <button type="button" onClick={() => setMaquinaSeleccionada(null)} className="p-2 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-all rounded-lg">
                  <X size={18}/>
                </button>
              </div>
            )}
          </div>

          {/* SELECCIÓN DE TÉCNICOS (MULTIPLE) */}
          <div className="space-y-3">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">2. Técnicos Responsables</label>
            
            <div className="flex flex-wrap gap-2 mb-3">
              <AnimatePresence>
                {tecnicosSeleccionados.map(t => (
                  <motion.span 
                    initial={{ scale: 0.8, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    key={t.id} 
                    className="flex items-center gap-2 px-3 py-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl text-xs font-black uppercase"
                  >
                    <User size={12} />
                    {t.nombre}
                    <button type="button" onClick={() => toggleTecnico(t)} className="hover:text-rose-400 transition-colors">
                      <X size={14} />
                    </button>
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>

            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Buscar técnico por nombre..." 
                className="w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-slate-700 rounded-2xl text-sm text-white focus:border-indigo-500 outline-none transition-all shadow-inner"
                value={busquedaTecnico}
                onChange={(e) => setBusquedaTecnico(e.target.value)}
              />
              {busquedaTecnico && (
                <div className="absolute z-50 w-full mt-2 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden border-t-0">
                  {usuariosFiltrados.map(u => (
                    <button 
                      key={u.id}
                      type="button"
                      onClick={() => toggleTecnico(u)}
                      className="w-full text-left px-5 py-4 hover:bg-slate-700 text-sm text-white border-b border-slate-700 last:border-0 flex justify-between items-center group/user"
                    >
                      <span className="font-bold group-hover/user:text-indigo-400 transition-colors">{u.nombre}</span>
                      <Plus size={16} className="text-slate-600 group-hover/user:text-indigo-400" />
                    </button>
                  ))}
                  {usuariosFiltrados.length === 0 && (
                    <div className="p-4 text-center text-[10px] text-slate-500 uppercase font-bold">No se encontraron más técnicos</div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1 flex items-center gap-2">
                <Calendar size={14} className="text-blue-500" /> 3. Fecha
              </label>
              <input 
                type="date"
                required
                className="w-full p-4 bg-slate-900/50 border border-slate-700 rounded-2xl text-sm text-white focus:border-blue-500 outline-none shadow-inner font-bold"
                value={formData.fecha}
                onChange={(e) => setFormData({...formData, fecha: e.target.value})}
              />
            </div>
            <div className="flex items-end">
               <div className="w-full p-4 bg-slate-900/30 border border-dashed border-slate-700 rounded-2xl flex items-center justify-center gap-2">
                  <ClipboardList size={16} className="text-slate-500" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Reporte Técnico</span>
               </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">4. Descripción de la Intervención</label>
            <textarea 
              required
              rows="3"
              placeholder="Detalla el trabajo realizado, repuestos cambiados, etc..."
              className="w-full p-5 bg-slate-900/50 border border-slate-700 rounded-[1.5rem] text-sm text-white focus:border-blue-500 outline-none resize-none shadow-inner"
              value={formData.descripcion}
              onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
            />
          </div>

          <button 
            disabled={enviando}
            type="submit" 
            className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-[1.5rem] font-black text-sm transition-all shadow-2xl shadow-blue-600/30 disabled:opacity-50 active:scale-[0.98] uppercase tracking-widest"
          >
            {enviando ? "PROCESANDO..." : "GUARDAR INTERVENCIÓN TÉCNICA"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
