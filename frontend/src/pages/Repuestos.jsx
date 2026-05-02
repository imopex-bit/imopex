import { useEffect, useState } from "react";
import { 
  Package, Search, Plus, Filter, MoreVertical, 
  AlertTriangle, ArrowUpRight, ArrowDownRight, 
  Trash2, Edit3, Settings2, History, PackageCheck, AlertCircle, ChevronLeft,
  Calendar, User, Wrench, ArrowRight, Download, Upload, ClipboardList, X,
  Tag, Info, Layers, Hash
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api";
import { Link } from "react-router-dom";

export default function Repuestos() {
  const [activeTab, setActiveTab] = useState("inventario"); 
  const [repuestos, setRepuestos] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [maquinas, setMaquinas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showMovModal, setShowMovModal] = useState(false);
  
  // Lógica de Movimientos
  const [movType, setMovType] = useState("salida"); 
  const [targetMaquina, setTargetMaquina] = useState("");
  const [searchMaquina, setSearchMaquina] = useState(""); 
  const [listaMovimientos, setListaMovimientos] = useState([]); 
  const [currentSelectedRepuesto, setCurrentSelectedRepuesto] = useState("");
  const [currentCantidad, setCurrentCantidad] = useState(1);
  const [currentObservacion, setCurrentObservacion] = useState("");

  const [formData, setFormData] = useState({
    codigo: "", nombre: "", categoria: "", stock_actual: 0, stock_minimo: 0, descripcion: ""
  });

  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  useEffect(() => { 
    cargarMaquinas(); 
    cargar();
  }, []);

  useEffect(() => {
    if (activeTab === "inventario") cargar();
    else cargarMovimientos();
  }, [activeTab]);

  const cargar = async () => {
    try {
      setLoading(true);
      const res = await api.get("/repuestos");
      setRepuestos(res || []);
    } catch (err) {
      console.error("Error cargar repuestos:", err);
    } finally {
      setLoading(false);
    }
  };

  const cargarMovimientos = async () => {
    try {
      setLoading(true);
      const res = await api.get("/repuestos/movimientos");
      setMovimientos(res || []);
    } catch (err) {
      console.error("Error cargar movimientos:", err);
    } finally {
      setLoading(false);
    }
  };

  const cargarMaquinas = async () => {
    try {
      const res = await api.get("/maquinas");
      setMaquinas(Array.isArray(res) ? res : (res.data || []));
    } catch (err) {
      console.error("Error cargar máquinas:", err);
    }
  };

  const agregarALista = () => {
    if (!currentSelectedRepuesto) return;
    const rep = repuestos.find(r => String(r.id) === String(currentSelectedRepuesto));
    if (!rep) return;
    if (listaMovimientos.find(m => String(m.repuesto_id) === String(currentSelectedRepuesto))) return;

    setListaMovimientos([...listaMovimientos, {
      repuesto_id: rep.id,
      nombre: rep.nombre,
      codigo: rep.codigo,
      cantidad: currentCantidad,
      observacion: currentObservacion
    }]);
    setCurrentSelectedRepuesto("");
    setCurrentCantidad(1);
    setCurrentObservacion("");
  };

  const handleMovSubmit = async (e) => {
    e.preventDefault();
    if (listaMovimientos.length === 0) return alert("Lista vacía");
    if (movType === "salida" && !targetMaquina) return alert("Seleccione máquina");

    try {
      await api.post("/repuestos/masivo", {
        movimientos: listaMovimientos,
        maquina_id: targetMaquina,
        tipo_movimiento: movType
      });
      setShowMovModal(false);
      setListaMovimientos([]);
      setTargetMaquina("");
      setSearchMaquina("");
      cargar();
      if (activeTab === "historial") cargarMovimientos();
      alert("Movimientos registrados ✅");
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) await api.put(`/repuestos/${currentId}`, formData);
      else await api.post("/repuestos", formData);
      setShowModal(false);
      resetForm();
      cargar();
      alert(editMode ? "Actualizado ✅" : "Creado ✅");
    } catch (err) {
      alert("Error al guardar");
    }
  };

  const resetForm = () => {
    setFormData({ codigo: "", nombre: "", categoria: "", stock_actual: 0, stock_minimo: 0, descripcion: "" });
    setEditMode(false);
    setCurrentId(null);
  };

  const filteredRepuestos = repuestos.filter(r => 
    String(r.nombre || "").toLowerCase().includes(busqueda.toLowerCase()) || 
    String(r.codigo || "").toLowerCase().includes(busqueda.toLowerCase())
  );

  const filteredMaquinas = maquinas.filter(m => 
    String(m.codigo || "").toLowerCase().includes(searchMaquina.toLowerCase()) ||
    String(m.descripcion || "").toLowerCase().includes(searchMaquina.toLowerCase())
  ).slice(0, 5);

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans relative overflow-hidden p-4 sm:p-6 lg:p-10">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-emerald-500/5 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-6 lg:space-y-10">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="p-3 bg-slate-800/40 backdrop-blur-md rounded-2xl border border-slate-700/50 hover:text-indigo-400 transition-all shadow-lg group">
              <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
            </Link>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3 uppercase">
                <Package className="text-indigo-400" size={32} />
                Gestión de Repuestos
              </h1>
              <p className="text-slate-500 text-[10px] sm:text-xs font-bold uppercase tracking-widest mt-1">Inventario & Movimientos</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="bg-slate-800/40 p-1 rounded-2xl border border-slate-700/50 flex shadow-inner">
              <button onClick={() => setActiveTab("inventario")} className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'inventario' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>INVENTARIO</button>
              <button onClick={() => setActiveTab("historial")} className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'historial' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>HISTORIAL</button>
            </div>
            {activeTab === "inventario" && (
              <div className="flex gap-2">
                <button onClick={() => { setMovType("salida"); setListaMovimientos([]); setShowMovModal(true); }} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-2xl font-black text-[10px] uppercase transition-all">
                  <ClipboardList size={18} /> Registrar Cambio
                </button>
                <button onClick={() => { resetForm(); setShowModal(true); }} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-[10px] uppercase transition-all shadow-xl shadow-indigo-600/20">
                  <Plus size={18} /> Nuevo
                </button>
              </div>
            )}
          </div>
        </div>

        {activeTab === "inventario" ? (
          <div className="space-y-6">
            <div className="relative group max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
              <input type="text" placeholder="Buscar por nombre o código..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="w-full bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-[1.5rem] py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all shadow-2xl" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence>
                {filteredRepuestos.map(r => (
                  <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={r.id} className="bg-slate-800/30 backdrop-blur-sm rounded-[2rem] border border-slate-700/40 p-6 flex flex-col justify-between hover:border-slate-600 transition-all shadow-lg hover:shadow-2xl">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black rounded-lg border border-indigo-500/20 uppercase tracking-widest">{r.codigo}</span>
                        <div className="flex gap-1">
                          <button onClick={() => { setEditMode(true); setCurrentId(r.id); setFormData(r); setShowModal(true); }} className="p-2 hover:bg-slate-700 rounded-lg text-slate-500 hover:text-white transition-all"><Edit3 size={16} /></button>
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-white mb-4 line-clamp-1">{r.nombre}</h3>
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-slate-900/50 p-3 rounded-2xl text-center border border-slate-700/30 shadow-inner">
                          <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Stock</p>
                          <p className={`text-xl font-black ${r.stock_actual <= r.stock_minimo ? "text-amber-400" : "text-emerald-400"}`}>{r.stock_actual}</p>
                        </div>
                        <div className="bg-slate-900/50 p-3 rounded-2xl text-center border border-slate-700/30 shadow-inner">
                          <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Mínimo</p>
                          <p className="text-xl font-black text-slate-300">{r.stock_minimo}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setMovType("entrada"); setListaMovimientos([{ repuesto_id: r.id, nombre: r.nombre, codigo: r.codigo, cantidad: 1, observacion: "" }]); setShowMovModal(true); }} className="flex-1 py-3 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 text-[10px] font-black uppercase transition-all">Entrada</button>
                      <button onClick={() => { setMovType("salida"); setListaMovimientos([{ repuesto_id: r.id, nombre: r.nombre, codigo: r.codigo, cantidad: 1, observacion: "" }]); setShowMovModal(true); }} className="flex-1 py-3 bg-blue-500/5 hover:bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20 text-[10px] font-black uppercase transition-all">Salida</button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <div className="bg-slate-800/20 backdrop-blur-md rounded-[2.5rem] border border-slate-700/50 shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-800/40 border-b border-slate-700/50">
                    <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Fecha / Hora</th>
                    <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Repuesto</th>
                    <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Tipo</th>
                    <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Cant</th>
                    <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Máquina / Destino</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/20">
                  {movimientos.map(m => (
                    <tr key={m.id} className="hover:bg-slate-700/10 transition-colors group">
                      <td className="p-5 text-xs text-slate-400 font-bold">{new Date(m.fecha).toLocaleString()}</td>
                      <td className="p-5 font-bold text-white text-sm">{m.repuestos?.nombre} <span className="text-[10px] text-slate-500 block font-normal">{m.repuestos?.codigo}</span></td>
                      <td className="p-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${m.tipo_movimiento === 'entrada' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>{m.tipo_movimiento}</span>
                      </td>
                      <td className="p-5 text-center font-black text-lg">{m.cantidad}</td>
                      <td className="p-5 text-xs">
                        {m.maquinas ? <div className="text-indigo-400 font-black flex items-center gap-1"><Wrench size={10}/> MÁQ: {m.maquinas.codigo}</div> : <div className="text-slate-600">N/A</div>}
                        <div className="text-slate-500 italic mt-1">{m.observacion}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 🚀 MODAL NUEVO/EDITAR REPUESTO */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-800 border border-slate-700 w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden my-auto">
            <div className="p-8 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
              <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{editMode ? "Actualizar" : "Nuevo"} Repuesto</h2>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Completa los campos técnicos abajo</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-700 rounded-full text-slate-400 transition-all"><X size={24}/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {/* Panel Izquierdo */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1 flex items-center gap-2"><Hash size={12} className="text-indigo-400"/> Código de Referencia</label>
                    <input required placeholder="Ej: R-1024" className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl p-4 text-sm text-white focus:border-indigo-500 outline-none transition-all shadow-inner" value={formData.codigo} onChange={e => setFormData({...formData, codigo: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1 flex items-center gap-2"><Tag size={12} className="text-indigo-400"/> Nombre del Repuesto</label>
                    <input required placeholder="Ej: Sensor de Presión" className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl p-4 text-sm text-white focus:border-indigo-500 outline-none transition-all shadow-inner" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
                  </div>
                </div>

                {/* Panel Derecho */}
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1 text-emerald-400">Cantidad Inicial</label>
                      <input type="number" className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl p-4 text-sm text-white focus:border-emerald-500 outline-none transition-all shadow-inner font-black" value={formData.stock_actual} onChange={e => setFormData({...formData, stock_actual: parseInt(e.target.value)||0})} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1 text-amber-400">Stock Mínimo</label>
                      <input type="number" className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl p-4 text-sm text-white focus:border-amber-500 outline-none transition-all shadow-inner font-black" value={formData.stock_minimo} onChange={e => setFormData({...formData, stock_minimo: parseInt(e.target.value)||0})} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1 flex items-center gap-2"><Layers size={12} className="text-indigo-400"/> Categoría / Familia</label>
                    <input placeholder="Ej: Hidráulica" className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl p-4 text-sm text-white focus:border-indigo-500 outline-none transition-all shadow-inner" value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value})} />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1 flex items-center gap-2"><Info size={12} className="text-indigo-400"/> Descripción Técnica</label>
                <textarea placeholder="Escribe detalles adicionales..." rows="3" className="w-full bg-slate-900/50 border border-slate-700 rounded-[1.5rem] p-4 text-sm text-white focus:border-indigo-500 outline-none resize-none shadow-inner" value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})}></textarea>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-5 bg-slate-700/30 hover:bg-slate-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest border border-slate-600 transition-all">Cancelar</button>
                <button type="submit" className="flex-1 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-indigo-600/30 border border-indigo-500/50 transition-all">{editMode ? "Actualizar" : "Crear"}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL DE MOVIMIENTOS */}
      {showMovModal && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-800 border border-slate-700 w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden my-auto">
            <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
              <h2 className="text-xl font-black text-white uppercase tracking-tighter">Registrar Cambio Masivo</h2>
              <button onClick={() => setShowMovModal(false)} className="p-2 hover:bg-slate-700 rounded-full text-slate-400 transition-all"><X size={24}/></button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-6 sm:p-8 space-y-6 border-b lg:border-b-0 lg:border-r border-slate-700">
                <div className="flex bg-slate-900/50 rounded-2xl p-1 border border-slate-700 shadow-inner">
                  <button onClick={() => setMovType("entrada")} className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${movType==='entrada'?'bg-emerald-600 text-white shadow-lg':'text-slate-500 hover:text-slate-300'}`}>ENTRADA</button>
                  <button onClick={() => setMovType("salida")} className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${movType==='salida'?'bg-blue-600 text-white shadow-lg':'text-slate-500 hover:text-slate-300'}`}>SALIDA</button>
                </div>

                {movType === "salida" && (
                  <div className="relative">
                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1">Máquina (Código)</label>
                    <input type="text" placeholder="Ej: 666..." className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl py-4 px-4 text-sm text-white focus:border-blue-500 outline-none shadow-inner" value={searchMaquina} onChange={e => { setSearchMaquina(e.target.value); setTargetMaquina(""); }} />
                    {searchMaquina && !targetMaquina && (
                      <div className="absolute z-50 w-full mt-2 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden max-h-[150px] overflow-y-auto">
                        {filteredMaquinas.map(m => (
                          <button key={m.id} onClick={() => { setTargetMaquina(m.id); setSearchMaquina(m.codigo); }} className="w-full text-left px-4 py-3 hover:bg-slate-700 text-[10px] font-bold text-white flex justify-between items-center border-b border-slate-700 last:border-0">
                            <span>{m.codigo}</span>
                            <span className="text-slate-500 text-[9px]">{m.descripcion || "Sin desc."}</span>
                          </button>
                        ))}
                        {filteredMaquinas.length === 0 && <div className="p-4 text-center text-[10px] text-slate-500">No se encontraron máquinas</div>}
                      </div>
                    )}
                  </div>
                )}

                <div className="bg-slate-900/30 p-5 rounded-[2rem] border border-slate-700/50 space-y-4 shadow-inner">
                  <select className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 text-sm text-white outline-none" value={currentSelectedRepuesto} onChange={e => setCurrentSelectedRepuesto(e.target.value)}>
                    <option value="">Seleccionar Repuesto...</option>
                    {repuestos.map(r => <option key={r.id} value={r.id}>{r.nombre} ({r.stock_actual})</option>)}
                  </select>
                  <div className="flex gap-2">
                    <input type="number" placeholder="Cant" className="w-20 bg-slate-900 border border-slate-700 rounded-xl p-4 text-white text-sm font-black" value={currentCantidad} onChange={e => setCurrentCantidad(parseInt(e.target.value)||1)} />
                    <input placeholder="Nota..." className="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-4 text-white text-xs" value={currentObservacion} onChange={e => setCurrentObservacion(e.target.value)} />
                  </div>
                  <button onClick={agregarALista} className="w-full py-4 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-2xl font-black text-[10px] uppercase tracking-widest">Añadir a la Carga</button>
                </div>
              </div>

              <div className="p-6 sm:p-8 flex flex-col h-[400px]">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center mb-4">Carga preparada ({listaMovimientos.length})</p>
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {listaMovimientos.map(m => (
                    <div key={m.repuesto_id} className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 flex justify-between items-center group">
                      <div className="text-xs font-black text-white uppercase tracking-tighter">{m.nombre} (x{m.cantidad})</div>
                      <button onClick={() => setListaMovimientos(listaMovimientos.filter(x => x.repuesto_id !== m.repuesto_id))} className="text-slate-600 hover:text-rose-400 transition-all"><X size={16}/></button>
                    </div>
                  ))}
                </div>
                <button onClick={handleMovSubmit} className="mt-6 w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[1.5rem] font-black text-sm shadow-2xl shadow-indigo-600/30 transition-all uppercase tracking-widest">PROCESAR CAMBIO</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
