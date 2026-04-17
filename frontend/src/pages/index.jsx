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
import { StatusDonutChart, LocationBarChart, AvailabilityBarChart } from "../components/DashboardCharts";
import api from "../api";

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

  const dataLocation = useMemo(() => {
    const counts = {};
    todas.forEach(m => counts[m.localidad] = (counts[m.localidad] || 0) + 1);
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [todas]);

  const dataAvailability = useMemo(() => {
    // Demo data for availability
    return todas.slice(0, 5).map(m => ({
      name: m.codigo,
      availability: m.estado === "funcional" ? 95 + Math.random() * 5 : 40 + Math.random() * 20
    }));
  }, [todas]);

  const tipos = [...new Set(todas.map(m => m.tipo_maquina))].filter(Boolean);
  const estados = ["funcional", "no funcional"];
  const localidades = [...new Set(todas.map(m => m.localidad))].filter(Boolean);


  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      
      {/* SIDEBAR / NAVBAR (Simplified) */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg text-white">
                <Activity size={24} />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                Imopex
              </span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <Link to="/dashboard" className="text-blue-600 font-medium">Dashboard</Link>
              <Link to="/mantenimientos" className="text-slate-500 hover:text-blue-600 transition">Mantenimientos</Link>
              <Link to="/importar" className="text-slate-500 hover:text-blue-600 transition">Importar</Link>
            </div>

            <button onClick={logout} className="flex items-center gap-2 text-slate-500 hover:text-red-600 transition">
              <LogOut size={20} />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        
        {/* DASHBOARD HERO */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-slate-500 text-sm font-medium">Total Máquinas</p>
            <div className="flex items-end justify-between mt-2">
              <h3 className="text-4xl font-bold text-slate-900">{stats.total}</h3>
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <Settings size={20} />
              </div>
            </div>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-slate-500 text-sm font-medium">Disponibilidad Promedio</p>
            <div className="flex items-end justify-between mt-2">
              <h3 className="text-4xl font-bold text-slate-900">{stats.disponibilidad}%</h3>
              <div className="h-2 w-24 bg-slate-100 rounded-full overflow-hidden mb-2">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-1000" 
                  style={{ width: `${stats.disponibilidad}%` }} 
                />
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-slate-500 text-sm font-medium">Mantenimientos Hoy</p>
            <div className="flex items-end justify-between mt-2">
              <h3 className="text-4xl font-bold text-slate-900">{mantHoy}</h3>
              <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                <History size={20} />
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-slate-500 text-sm font-medium">Alertas Activas</p>
            <div className="flex items-end justify-between mt-2">
              <h3 className="text-4xl font-bold text-slate-900">{stats.alertas}</h3>
              <span className={`text-sm font-bold flex items-center gap-1 ${stats.alertas > 0 ? "text-red-500 animate-pulse" : "text-emerald-500"}`}>
                ● {stats.alertas > 0 ? "Crítico" : "Normal"}
              </span>
            </div>
          </motion.div>
        </section>


        {/* CHARTS SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-1">
            <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-blue-600 rounded-full" />
              Estado de Flota
            </h4>
            <StatusDonutChart data={dataStatus} />
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-1">
            <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-indigo-600 rounded-full" />
              Distribución Geográfica
            </h4>
            <LocationBarChart data={dataLocation} />
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-1">
            <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-emerald-600 rounded-full" />
              Disponibilidad por Máquina
            </h4>
            <AvailabilityBarChart data={dataAvailability} />
          </div>
        </section>

        {/* MAIN TABLE SECTION */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <h2 className="text-2xl font-bold text-slate-800">Inventario de Máquinas</h2>
              <div className="flex items-center gap-3">
                <Link to="/importar" className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition text-sm font-semibold">
                  <Download size={18} />
                  Importar
                </Link>
                <button 
                  onClick={() => setCreando(true)}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 text-sm font-bold"
                >
                  <Plus size={18} />
                  Nueva Máquina
                </button>
              </div>
            </div>

            {/* FILTERS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Buscar por código o serial..." 
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition text-sm"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl">
                <Filter size={18} className="text-slate-400" />
                <select 
                  className="w-full bg-transparent border-none focus:ring-0 text-sm"
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value)}
                >
                  <option value="">Todos los Tipos</option>
                  {tipos.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl">
                <Activity size={18} className="text-slate-400" />
                <select 
                  className="w-full bg-transparent border-none focus:ring-0 text-sm"
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                >
                  <option value="">Todos los Estados</option>
                  {estados.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl">
                <Settings size={18} className="text-slate-400" />
                <select 
                  className="w-full bg-transparent border-none focus:ring-0 text-sm"
                  value={filtroLocalidad}
                  onChange={(e) => setFiltroLocalidad(e.target.value)}
                >
                  <option value="">Todas las Localidades</option>
                  {localidades.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-500 font-medium border-b border-slate-100">
                  <th className="px-6 py-4">Código</th>
                  <th className="px-6 py-4">Info Técnica</th>
                  <th className="px-6 py-4">Tipo</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4">Localidad</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginadas.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{m.codigo}</div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider">{String(m.id).slice(0, 8)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-600 text-xs">S/N: {m.serial_maquina || "N/A"}</div>
                      <div className="text-slate-400 text-[11px]">Bill: {m.serial_billetero || "N/A"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-[11px] font-bold uppercase">
                        {m.tipo_maquina}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
                        ${m.estado === "funcional" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}
                      `}>
                        <span className={`w-1.5 h-1.5 rounded-full ${m.estado === "funcional" ? "bg-emerald-500" : "bg-rose-500"}`} />
                        {m.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {m.localidad}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setSeleccionada(m)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                          <Eye size={18} />
                        </button>
                        <button onClick={() => setEditando(m)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition">
                          <Edit3 size={18} />
                        </button>
                        <button onClick={() => eliminar(m.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition">
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
          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Mostrando <span className="font-bold">{paginadas.length}</span> de <span className="font-bold">{maquinas.length}</span> resultados
            </p>
            <div className="flex items-center gap-2">
              <button 
                disabled={paginaActual === 1}
                onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                className="p-2 text-slate-400 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-slate-400"
              >
                <ChevronLeft size={20} />
              </button>
              {[...Array(totalPaginas)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPaginaActual(i + 1)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition ${paginaActual === i + 1 ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-200"}`}
                >
                  {i + 1}
                </button>
              ))}
              <button 
                disabled={paginaActual === totalPaginas}
                onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                className="p-2 text-slate-400 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-slate-400"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </section>
      </main>

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

