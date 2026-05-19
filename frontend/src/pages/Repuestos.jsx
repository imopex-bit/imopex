import { useEffect, useState, useMemo } from "react";
import { 
  Package, Search, Plus, Filter, MoreVertical, 
  AlertTriangle, ArrowUpRight, ArrowDownRight, 
  Trash2, Edit3, Settings2, History, PackageCheck, AlertCircle, ChevronLeft, ChevronRight,
  Calendar, User, Wrench, ArrowRight, Download, Upload, ClipboardList, X,
  Tag, Info, Layers, Hash
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api";
import { Link } from "react-router-dom";
import { useAlert } from "../context/AlertContext";

export default function Repuestos() {
  const { showAlert, showConfirm } = useAlert();
  const [activeTab, setActiveTab] = useState("inventario"); 
  const [repuestos, setRepuestos] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cache_repuestos")) || [];
    } catch {
      return [];
    }
  });
  const [movimientos, setMovimientos] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cache_movimientos")) || [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(() => {
    try {
      const cache = localStorage.getItem("cache_repuestos");
      return !cache;
    } catch {
      return true;
    }
  });
  const [busqueda, setBusqueda] = useState("");
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showQuickMovModal, setShowQuickMovModal] = useState(false);
  const [quickMovData, setQuickMovData] = useState({ repuesto_id: "", nombre: "", codigo: "", cantidad: 1, observacion: "", tipo: "entrada" });

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 8;
  
  // Lógica de Movimientos Rápidos
  const [currentSelectedRepuesto, setCurrentSelectedRepuesto] = useState("");
  const [currentCantidad, setCurrentCantidad] = useState(1);
  const [currentObservacion, setCurrentObservacion] = useState("");
  const [currentMotivo, setCurrentMotivo] = useState("normal"); // normal, defectuoso, devolucion

  const [formData, setFormData] = useState({
    codigo: "", nombre: "", categoria: "", stock_actual: 0, stock_minimo: 0, descripcion: ""
  });

  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  useEffect(() => { 
    cargar();
  }, []);

  useEffect(() => {
    setPaginaActual(1);
    if (activeTab === "inventario") cargar();
    else cargarMovimientos();
  }, [activeTab]);

  const cargar = async () => {
    try {
      setLoading(repuestos.length === 0);
      const res = await api.get("/repuestos");
      if (res) {
        setRepuestos(res);
        localStorage.setItem("cache_repuestos", JSON.stringify(res));
      }
    } catch (err) {
      console.error("Error cargar repuestos:", err);
    } finally {
      setLoading(false);
    }
  };

  const cargarMovimientos = async () => {
    try {
      setLoading(movimientos.length === 0);
      const res = await api.get("/repuestos/movimientos");
      if (res) {
        setMovimientos(res);
        localStorage.setItem("cache_movimientos", JSON.stringify(res));
      }
    } catch (err) {
      console.error("Error cargar movimientos:", err);
    } finally {
      setLoading(false);
    }
  };





  const handleQuickMovSubmit = async (e) => {
    e.preventDefault();
    if (!quickMovData.observacion.trim()) {
      showAlert("La descripción es obligatoria", "warning");
      return;
    }
    try {
      await api.post("/repuestos/masivo", {
        movimientos: [{
          ...quickMovData,
          motivo: "normal" // default
        }],
        maquina_id: null,
        tipo_movimiento: quickMovData.tipo
      });
      setShowQuickMovModal(false);
      cargar();
      if (activeTab === "historial") cargarMovimientos();
      showAlert("Movimiento registrado ✅", "success");
    } catch (err) {
      showAlert("Error: " + err.message, "error");
    }
  };

  const handleEliminarRepuesto = async (id) => {
    const isConfirmed = await showConfirm("¿Estás seguro de eliminar este repuesto? Se borrarán todos sus datos.");
    if (!isConfirmed) return;

    try {
      await api.delete(`/repuestos/${id}`);
      cargar();
      showAlert("Repuesto eliminado ✅", "success");
    } catch (err) {
      showAlert("Error: " + err.message, "error");
    }
  };

  const handleRevertirMovimiento = async (id) => {
    const isConfirmed = await showConfirm("¿Deseas deshacer esta acción? El stock se ajustará automáticamente.");
    if (!isConfirmed) return;

    try {
      await api.delete(`/repuestos/movimientos/${id}`);
      cargarMovimientos();
      cargar(); // Actualizar stock en la otra pestaña
      showAlert("Acción revertida con éxito ✅", "success");
    } catch (err) {
      showAlert("Error: " + err.message, "error");
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
      showAlert(editMode ? "Actualizado ✅" : "Creado ✅", "success");
    } catch (err) {
      showAlert("Error al guardar", "error");
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

  const paginadas = useMemo(() => {
    const inicio = (paginaActual - 1) * itemsPorPagina;
    return filteredRepuestos.slice(inicio, inicio + itemsPorPagina);
  }, [filteredRepuestos, paginaActual]);

  const totalPaginas = Math.ceil(filteredRepuestos.length / itemsPorPagina);

  const movimientosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * itemsPorPagina;
    return movimientos.slice(inicio, inicio + itemsPorPagina);
  }, [movimientos, paginaActual]);

  const totalPaginasMovimientos = Math.ceil(movimientos.length / itemsPorPagina);



  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-emerald-500/5 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative z-10 h-full flex flex-col">
        <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-10 space-y-6 lg:space-y-10 flex-1 w-full">
          
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
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
            <div className="flex gap-2">
              <button onClick={() => { resetForm(); setShowModal(true); }} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-[10px] uppercase transition-all shadow-xl shadow-indigo-600/20">
                <Plus size={18} /> Nuevo
              </button>
            </div>
          </div>
        </div>

        {/* 📊 INDICADORES DE BODEGA */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-800/30 backdrop-blur-md rounded-[1.5rem] border border-slate-700/40 p-5 flex items-center gap-4 shadow-lg">
            <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400"><Package size={24} /></div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Ítems</p>
              <h3 className="text-xl font-black text-white">{repuestos.length}</h3>
            </div>
          </div>
          <div className="bg-slate-800/30 backdrop-blur-md rounded-[1.5rem] border border-slate-700/40 p-5 flex items-center gap-4 shadow-lg">
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400"><AlertTriangle size={24} /></div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Stock Crítico</p>
              <h3 className="text-xl font-black text-white">{repuestos.filter(r => (r.stock_actual || 0) <= (r.stock_minimo || 0) && (r.stock_actual || 0) > 0).length}</h3>
            </div>
          </div>
          <div className="bg-slate-800/30 backdrop-blur-md rounded-[1.5rem] border border-slate-700/40 p-5 flex items-center gap-4 shadow-lg">
            <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400"><X size={24} /></div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Agotados</p>
              <h3 className="text-xl font-black text-white">{repuestos.filter(r => (r.stock_actual || 0) === 0).length}</h3>
            </div>
          </div>
        </div>

        {activeTab === "inventario" ? (
          <section className="bg-slate-800/40 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-700/50 space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h2 className="text-2xl font-extrabold text-white tracking-tight">Catálogo de Repuestos</h2>
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <div className="relative group flex-1 md:w-64">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                    <input 
                      type="text" 
                      placeholder="Buscar por nombre o código..." 
                      className="w-full pl-11 pr-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm text-white placeholder:text-slate-500 outline-none"
                      value={busqueda}
                      onChange={(e) => { setBusqueda(e.target.value); setPaginaActual(1); }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="bg-slate-900/60 text-slate-400 text-xs uppercase tracking-wider font-bold border-b border-slate-700/50">
                    <th className="px-6 py-5">Código / Ref.</th>
                    <th className="px-6 py-5">Repuesto</th>
                    <th className="px-6 py-5">Categoría</th>
                    <th className="px-6 py-5">Stock</th>
                    <th className="px-6 py-5 text-center">Movimientos</th>
                    <th className="px-6 py-5 text-right">Gestión</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {paginadas.map(r => {
                    const stockLevel = (r.stock_actual / (r.stock_minimo * 2)) * 100;
                    const isLow = r.stock_actual <= r.stock_minimo;
                    const isOut = r.stock_actual === 0;
                    
                    return (
                    <tr key={r.id} className="hover:bg-slate-700/30 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-400 text-xs font-black rounded-lg border border-indigo-500/20 uppercase tracking-tighter">{r.codigo}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-extrabold text-white text-base">{r.nombre}</div>
                        <div className="text-[11px] text-slate-400 mt-1">{r.descripcion || "Sin descripción"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-slate-300 font-bold uppercase tracking-widest">{r.categoria || "Sin Categoría"}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5">
                          <span className={`text-sm font-black ${isOut ? "text-rose-400" : isLow ? "text-amber-400" : "text-emerald-400"}`}>
                            {r.stock_actual} <span className="text-xs text-slate-500 font-bold">/ Mín {r.stock_minimo}</span>
                          </span>
                          <div className="h-1.5 w-24 bg-slate-900/50 rounded-full overflow-hidden border border-slate-700/30">
                            <div 
                              className={`h-full rounded-full ${isOut ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]" : isLow ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]" : "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]"}`}
                              style={{ width: `${Math.min(Math.max(stockLevel, 5), 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => { setQuickMovData({ repuesto_id: r.id, nombre: r.nombre, codigo: r.codigo, cantidad: 1, observacion: "", tipo: "entrada" }); setShowQuickMovModal(true); }} className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30 text-[10px] font-black uppercase transition-all flex items-center gap-1">
                            <Plus size={14}/> Entrada
                          </button>
                          <button onClick={() => { setQuickMovData({ repuesto_id: r.id, nombre: r.nombre, codigo: r.codigo, cantidad: 1, observacion: "", tipo: "salida" }); setShowQuickMovModal(true); }} className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30 text-[10px] font-black uppercase transition-all flex items-center gap-1">
                            <ArrowRight size={14}/> Salida
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditMode(true); setCurrentId(r.id); setFormData(r); setShowModal(true); }} className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors" title="Editar">
                            <Edit3 size={18} />
                          </button>
                          <button onClick={() => handleEliminarRepuesto(r.id)} className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors" title="Eliminar">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            <div className="px-6 py-4 bg-slate-900/40 border-t border-slate-700/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-slate-400 font-medium tracking-wide">
                Mostrando <span className="text-white font-bold">{paginadas.length}</span> de <span className="text-white font-bold">{filteredRepuestos.length}</span> registros
              </p>
              <div className="flex items-center gap-1.5">
                <button 
                  disabled={paginaActual === 1}
                  onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                  className="p-2 text-slate-400 hover:text-indigo-400 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="flex gap-1">
                  {[...Array(totalPaginas)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPaginaActual(i + 1)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${paginaActual === i + 1 ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30" : "text-slate-400 hover:bg-slate-700 hover:text-white"}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button 
                  disabled={paginaActual === totalPaginas}
                  onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                  className="p-2 text-slate-400 hover:text-indigo-400 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </section>
        ) : (
          <div className="bg-slate-800/20 backdrop-blur-md rounded-[2.5rem] border border-slate-700/50 shadow-2xl overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-800/40 border-b border-slate-700/50">
                    <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Fecha / Hora</th>
                    <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Repuesto</th>
                    <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Tipo</th>
                    <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Cant</th>
                    <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Descripción / Motivo</th>
                    <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/20">
                  {movimientosPaginados.map(m => (
                    <tr key={m.id} className="hover:bg-slate-700/10 transition-colors group">
                      <td className="p-5 text-xs text-slate-400 font-bold">{new Date(m.fecha).toLocaleString()}</td>
                      <td className="p-5 font-bold text-white text-sm">{m.repuestos?.nombre} <span className="text-[10px] text-slate-500 block font-normal">{m.repuestos?.codigo}</span></td>
                      <td className="p-5">
                        <div className="flex flex-col gap-1">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase w-fit ${m.tipo_movimiento === 'entrada' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>{m.tipo_movimiento}</span>
                          {m.observacion?.includes("[DEFECTUOSO]") && (
                            <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded text-[8px] font-black uppercase w-fit flex items-center gap-1">
                              <AlertTriangle size={8}/> Defectuoso
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-5 text-center font-black text-lg">{m.cantidad}</td>
                      <td className="p-5 text-xs text-slate-400 font-medium italic">
                        {m.observacion || "Sin descripción"}
                      </td>
                      <td className="p-5 text-right">
                        <button onClick={() => handleRevertirMovimiento(m.id)} className="p-2 hover:bg-rose-900/30 rounded-lg text-slate-500 hover:text-rose-400 transition-all group-hover:scale-110 shadow-lg" title="Deshacer Movimiento">
                          <History size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PAGINATION HISTORIAL */}
            {movimientos.length > itemsPorPagina && (
              <div className="px-6 py-4 bg-slate-900/40 border-t border-slate-700/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-slate-400 font-medium tracking-wide">
                  Mostrando <span className="text-white font-bold">{movimientosPaginados.length}</span> de <span className="text-white font-bold">{movimientos.length}</span> registros
                </p>
                <div className="flex items-center gap-1.5">
                  <button 
                    disabled={paginaActual === 1}
                    onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                    className="p-2 text-slate-400 hover:text-indigo-400 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <div className="flex gap-1">
                    {[...Array(totalPaginasMovimientos)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPaginaActual(i + 1)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${paginaActual === i + 1 ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30" : "text-slate-400 hover:bg-slate-700 hover:text-white"}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button 
                    disabled={paginaActual === totalPaginasMovimientos}
                    onClick={() => setPaginaActual(p => Math.min(totalPaginasMovimientos, p + 1))}
                    className="p-2 text-slate-400 hover:text-indigo-400 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        </main>
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
                      <input type="number" className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl p-4 text-sm text-white focus:border-emerald-500 outline-none transition-all shadow-inner font-black [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={formData.stock_actual} onChange={e => setFormData({...formData, stock_actual: e.target.value === "" ? "" : parseInt(e.target.value)})} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1 text-amber-400">Stock Mínimo</label>
                      <input type="number" className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl p-4 text-sm text-white focus:border-amber-500 outline-none transition-all shadow-inner font-black [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={formData.stock_minimo} onChange={e => setFormData({...formData, stock_minimo: e.target.value === "" ? "" : parseInt(e.target.value)})} />
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



      {/* MODAL MOVIMIENTO RÁPIDO (INDIVIDUAL) */}
      {showQuickMovModal && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-[60] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-800 border border-slate-700 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden my-auto">
            <div className={`p-6 border-b border-slate-700 flex justify-between items-center ${quickMovData.tipo === 'entrada' ? 'bg-emerald-500/10' : 'bg-blue-500/10'}`}>
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tighter">
                  {quickMovData.tipo === "entrada" ? "Registrar Entrada" : "Registrar Salida"}
                </h2>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                  Repuesto: {quickMovData.nombre}
                </p>
              </div>
              <button onClick={() => setShowQuickMovModal(false)} className="p-2 hover:bg-slate-700 rounded-full text-slate-400 transition-all"><X size={24}/></button>
            </div>
            
            <form onSubmit={handleQuickMovSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">
                  ¿Cuántos {quickMovData.tipo === "entrada" ? "entran" : "salen"}?
                </label>
                <input 
                  type="number" 
                  min="1"
                  required 
                  className={`w-full bg-slate-900/50 border rounded-2xl p-4 text-2xl font-black text-white outline-none text-center shadow-inner [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${quickMovData.tipo === 'entrada' ? 'border-emerald-500/50 focus:border-emerald-500' : 'border-blue-500/50 focus:border-blue-500'}`}
                  value={quickMovData.cantidad} 
                  onChange={e => setQuickMovData({...quickMovData, cantidad: e.target.value === "" ? "" : parseInt(e.target.value)})} 
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">
                  Descripción / Motivo (Obligatorio)
                </label>
                <textarea 
                  required 
                  placeholder={quickMovData.tipo === "entrada" ? "Ej: Compra a proveedor..." : "Ej: Instalación en máquina..."}
                  rows="3" 
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-[1.5rem] p-4 text-sm text-white focus:border-indigo-500 outline-none resize-none shadow-inner" 
                  value={quickMovData.observacion} 
                  onChange={e => setQuickMovData({...quickMovData, observacion: e.target.value})}
                ></textarea>
              </div>

              <button 
                type="submit" 
                className={`w-full py-5 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl ${quickMovData.tipo === 'entrada' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20'}`}
              >
                Confirmar {quickMovData.tipo}
              </button>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}
