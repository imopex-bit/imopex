import { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  Plus, Search, Filter, LogOut, Download, Activity, 
  Settings, History, Trash2, Eye, Edit3, ChevronLeft, ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ModalMaquina from "../components/ModalMaquina";
import ModalEditarMaquina from "../components/ModalEditarMaquina";
import ModalCrearMaquina from "../components/ModalCrearMaquina";
import { StatusDonutChart } from "../components/DashboardCharts";
import api from "../api";
import logo from "../assets/logo.webp";

export default function Index() {
  const [todas, setTodas] = useState([]);
  const [maquinas, setMaquinas] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroLocalidad, setFiltroLocalidad] = useState("");

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 8;

  const [seleccionada, setSeleccionada] = useState(null);
  const [editando, setEditando] = useState(null);
  const [creando, setCreando] = useState(false);
  const [cargando, setCargando] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/");
  }, [navigate]);

  // Métricas dinámicas
  const stats = useMemo(() => {
    const total = todas.length;
    const funcionales = todas.filter(m => m.estado === "funcional").length;
    const fallidas = todas.filter(m => m.estado === "no funcional").length;
    const disponibilidad = total > 0 ? ((funcionales / total) * 100).toFixed(1) : 0;
    
    return {
      total,
      disponibilidad,
      alertas: fallidas
    };
  }, [todas]);

  const [mantHoy, setMantHoy] = useState(0);

  const cargar = async () => {
    setCargando(true);
    try {
      const [resMaquinas, resMant] = await Promise.all([
        api.get("/maquinas"),
        api.get("/mantenimiento").catch(() => []) // Evitar que falle si no hay mantenimientos
      ]);

      if (Array.isArray(resMaquinas)) setTodas(resMaquinas);
      
      if (Array.isArray(resMant)) {
        const hoy = new Date().toISOString().split("T")[0];
        const count = resMant.filter(m => String(m.fecha).startsWith(hoy)).length;
        setMantHoy(count);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const eliminar = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar esta máquina?")) return;
    try {
      await api.delete(`/maquinas/${id}`);
      cargar();
    } catch (err) {
      alert("Error al eliminar");
    }
  };

  // Filtrado y Paginación
  useEffect(() => {
    let filtradas = [...todas];
    if (busqueda) {
      filtradas = filtradas.filter(m =>
        String(m.codigo || "").toLowerCase().includes(busqueda.toLowerCase()) ||
        String(m.serial_maquina || "").toLowerCase().includes(busqueda.toLowerCase())
      );
    }
    if (filtroTipo) filtradas = filtradas.filter(m => m.tipo_maquina === filtroTipo);
    if (filtroEstado) filtradas = filtradas.filter(m => m.estado === filtroEstado);
    if (filtroLocalidad) filtradas = filtradas.filter(m => m.localidad === filtroLocalidad);

    setMaquinas(filtradas);
    setPaginaActual(1); // Reset a primera página al filtrar
  }, [todas, busqueda, filtroTipo, filtroEstado, filtroLocalidad]);

  const paginadas = useMemo(() => {
    const inicio = (paginaActual - 1) * itemsPorPagina;
    return maquinas.slice(inicio, inicio + itemsPorPagina);
  }, [maquinas, paginaActual]);

  const totalPaginas = Math.ceil(maquinas.length / itemsPorPagina);

  // Datos para Gráficas
  const dataStatus = useMemo(() => {
    const counts = {};
    todas.forEach(m => counts[m.estado] = (counts[m.estado] || 0) + 1);
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [todas]);



  const tipos = [...new Set(todas.map(m => m.tipo_maquina))].filter(Boolean);
  const estados = ["funcional", "no funcional"];
  const localidades = [...new Set(todas.map(m => m.localidad))].filter(Boolean);


  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans relative overflow-hidden">
      
      {/* Background ambient gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/10 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="relative z-10 h-full flex flex-col">
        {/* NAVBAR GLASSMORPHIC */}
        <nav className="bg-slate-900/60 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-50 shadow-lg shadow-slate-900/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg border border-white/10 overflow-hidden relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <img src={logo} alt="Imopex Logo" className="w-[85%] h-[85%] object-contain relative z-10" />
                </div>
                <span className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight">
                  Imopex
                </span>
              </div>
              <div className="hidden md:flex items-center gap-6">
                <Link to="/dashboard" className="text-indigo-400 font-bold border-b-2 border-indigo-500 pb-1 mt-1">Dashboard</Link>
                <Link to="/mantenimientos" className="text-slate-400 hover:text-indigo-300 font-medium transition-colors mt-1">Mantenimientos</Link>
                <Link to="/repuestos" className="text-slate-400 hover:text-indigo-300 font-medium transition-colors mt-1">Repuestos</Link>
                <Link to="/importar" className="text-slate-400 hover:text-indigo-300 font-medium transition-colors mt-1">Importar</Link>
              </div>

              <button onClick={logout} className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-slate-700/50 rounded-xl transition-all shadow-sm">
                <LogOut size={18} />
                <span className="hidden sm:inline font-semibold text-sm">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 flex-1 w-full">
          
          {/* DASHBOARD HERO STATS */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-800/40 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-slate-700/50 group hover:bg-slate-800/60 transition-colors">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Máquinas</p>
              <div className="flex items-end justify-between mt-3">
                <h3 className="text-4xl font-extrabold text-white">{stats.total}</h3>
                <div className="p-2.5 bg-indigo-500/20 rounded-xl text-indigo-400 group-hover:scale-110 transition-transform">
                  <Settings size={22} />
                </div>
              </div>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-slate-800/40 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-slate-700/50 group hover:bg-slate-800/60 transition-colors">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Disponibilidad Media</p>
              <div className="flex items-end justify-between mt-3">
                <h3 className="text-4xl font-extrabold text-white">{stats.disponibilidad}%</h3>
                <div className="h-2 w-24 bg-slate-700/50 rounded-full overflow-hidden mb-2 shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-1000" 
                    style={{ width: `${stats.disponibilidad}%` }} 
                  />
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-slate-800/40 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-slate-700/50 group hover:bg-slate-800/60 transition-colors">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Mantenimientos Hoy</p>
              <div className="flex items-end justify-between mt-3">
                <h3 className="text-4xl font-extrabold text-white">{mantHoy}</h3>
                <div className="p-2.5 bg-amber-500/20 rounded-xl text-amber-400 group-hover:scale-110 transition-transform">
                  <History size={22} />
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-slate-800/40 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-slate-700/50 group hover:bg-slate-800/60 transition-colors">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Alertas Críticas</p>
              <div className="flex items-end justify-between mt-3">
                <h3 className="text-4xl font-extrabold text-white">{stats.alertas}</h3>
                <span className={`text-xs font-bold flex items-center gap-1.5 px-2.5 py-1 rounded-full ${stats.alertas > 0 ? "bg-rose-500/20 text-rose-400 animate-pulse border border-rose-500/30" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${stats.alertas > 0 ? "bg-rose-400" : "bg-emerald-400"}`}></span>
                  {stats.alertas > 0 ? "Atención" : "Estable"}
                </span>
              </div>
            </motion.div>
          </section>


          {/* CHARTS SECTION */}
          <section className="grid grid-cols-1 lg:grid-cols-1 gap-6 max-w-xl mx-auto">
            <div className="bg-slate-800/40 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-slate-700/50">
              <h4 className="text-slate-200 font-bold mb-6 flex items-center gap-2 text-sm uppercase tracking-wider">
                <div className="w-1.5 h-6 bg-gradient-to-b from-indigo-400 to-indigo-600 rounded-full" />
                Estado de Flota
              </h4>
              <div className="opacity-90"><StatusDonutChart data={dataStatus} /></div>
            </div>
          </section>

          {/* MAIN TABLE SECTION */}
          <section className="bg-slate-800/40 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-700/50 space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h2 className="text-2xl font-extrabold text-white tracking-tight">Inventario Global</h2>
                <div className="flex items-center gap-3">
                  <Link to="/importar" className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-slate-300 border border-slate-600 hover:bg-slate-700 rounded-xl transition-all text-sm font-semibold hover:-translate-y-0.5">
                    <Download size={18} />
                    Importar
                  </Link>
                  <button 
                    onClick={() => setCreando(true)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all text-sm font-bold hover:-translate-y-0.5 active:scale-95"
                  >
                    <Plus size={18} />
                    Nueva Máquina
                  </button>
                </div>
              </div>

              {/* FILTERS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative group">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                  <input 
                    type="text" 
                    placeholder="Buscar por código o serial..." 
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm text-white placeholder:text-slate-500 outline-none"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-slate-900/50 border border-slate-700 rounded-xl focus-within:border-indigo-500 transition-colors">
                  <Filter size={18} className="text-slate-500 ml-1" />
                  <select 
                    className="w-full bg-transparent border-none focus:ring-0 text-sm text-slate-300 outline-none cursor-pointer py-1.5"
                    value={filtroTipo}
                    onChange={(e) => setFiltroTipo(e.target.value)}
                  >
                    <option value="" className="bg-slate-800">Todos los Tipos</option>
                    {tipos.map(t => <option key={t} value={t} className="bg-slate-800">{t}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-slate-900/50 border border-slate-700 rounded-xl focus-within:border-indigo-500 transition-colors">
                  <Activity size={18} className="text-slate-500 ml-1" />
                  <select 
                    className="w-full bg-transparent border-none focus:ring-0 text-sm text-slate-300 outline-none cursor-pointer py-1.5"
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                  >
                    <option value="" className="bg-slate-800">Todos los Estados</option>
                    {estados.map(e => <option key={e} value={e} className="bg-slate-800">{e}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-slate-900/50 border border-slate-700 rounded-xl focus-within:border-indigo-500 transition-colors">
                  <Settings size={18} className="text-slate-500 ml-1" />
                  <select 
                    className="w-full bg-transparent border-none focus:ring-0 text-sm text-slate-300 outline-none cursor-pointer py-1.5"
                    value={filtroLocalidad}
                    onChange={(e) => setFiltroLocalidad(e.target.value)}
                  >
                    <option value="" className="bg-slate-800">Todas las Localidades</option>
                    {localidades.map(l => <option key={l} value={l} className="bg-slate-800">{l}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="bg-slate-900/60 text-slate-400 text-xs uppercase tracking-wider font-bold border-b border-slate-700/50">
                    <th className="px-6 py-5">Código / ID</th>
                    <th className="px-6 py-5">Info Técnica</th>
                    <th className="px-6 py-5">Tipo</th>
                    <th className="px-6 py-5">Estado</th>
                    <th className="px-6 py-5">Localidad</th>
                    <th className="px-6 py-5 text-right">Gestión</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {paginadas.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-700/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-extrabold text-white text-base">{m.codigo}</div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-widest font-mono mt-0.5">#{String(m.id).slice(0, 8)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-300 text-xs flex items-center gap-2">
                          <span className="text-slate-500">S/N:</span> <span className="font-mono">{m.serial_maquina || "N/A"}</span>
                        </div>
                        <div className="text-slate-400 text-[11px] mt-1 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-tighter w-5">B1:</span> 
                            <span className="font-mono">{m.serial_billetero_1 || m.serial_billetero || "N/A"}</span>
                          </div>
                          {m.serial_billetero_2 && (
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-tighter w-5">B2:</span> 
                              <span className="font-mono">{m.serial_billetero_2}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-md text-[11px] font-bold uppercase tracking-wider">
                          {m.tipo_maquina}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border
                          ${m.estado === "funcional" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"}
                        `}>
                          <span className={`w-1.5 h-1.5 rounded-full shadow-sm ${m.estado === "funcional" ? "bg-emerald-400 shadow-emerald-500/50" : "bg-rose-400 shadow-rose-500/50"}`} />
                          {m.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-300 font-medium">
                        {m.localidad}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setSeleccionada(m)} className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors" title="Ver Detalles">
                            <Eye size={18} />
                          </button>
                          <button onClick={() => setEditando(m)} className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors" title="Editar">
                            <Edit3 size={18} />
                          </button>
                          <button onClick={() => eliminar(m.id)} className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors" title="Eliminar">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            <div className="px-6 py-4 bg-slate-900/40 border-t border-slate-700/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-slate-400 font-medium tracking-wide">
                Mostrando <span className="text-white font-bold">{paginadas.length}</span> de <span className="text-white font-bold">{maquinas.length}</span> registros
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
        </main>
      </div>

      {/* MODALES */}
      <AnimatePresence>
        {seleccionada && (
          <ModalMaquina
            maquina={seleccionada}
            onClose={() => setSeleccionada(null)}
          />
        )}
        {editando && (
          <ModalEditarMaquina
            maquina={editando}
            onClose={() => setEditando(null)}
            onUpdated={cargar}
          />
        )}
        {creando && (
          <ModalCrearMaquina
            onClose={() => setCreando(false)}
            onCreated={cargar}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

