import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Trash2, Plus, Search, Wrench, History as HistoryIcon, User, Calendar, Cpu, X, AlertTriangle, Package, ArrowRight, Save } from "lucide-react";
import api from "../api"; // ✅ default import
import { useAlert } from "../context/AlertContext";

export default function MaquinaDetalle() {
  const { showAlert, showConfirm } = useAlert();
  const { id } = useParams();
  const navigate = useNavigate();

  const [maquina, setMaquina] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  
  const [repuestosDisponibles, setRepuestosDisponibles] = useState([]);
  const [repuestoSeleccionado, setRepuestoSeleccionado] = useState("");
  const [cantidadRepuesto, setCantidadRepuesto] = useState(1);

  const [descripcion, setDescripcion] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [filtrados, setFiltrados] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);

  const [loading, setLoading] = useState(true);

  // 🔹 cargar máquina
  const cargarMaquina = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/maquinas/${id}`);
      setMaquina(res.data || res);
    } catch (err) {
      console.log(err);
      showAlert("Error cargando máquina", "error");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 cargar usuarios
  const cargarUsuarios = async () => {
    try {
      const res = await api.get("/usuarios");
      setUsuarios(res.data || res);
    } catch (err) {
      console.log(err);
      showAlert("Error cargando usuarios", "error");
    }
  };

  const cargarRepuestos = async () => {
    try {
      const res = await api.get("/repuestos");
      setRepuestosDisponibles(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    cargarMaquina();
    cargarUsuarios();
    cargarRepuestos();
  }, [id]);

  const handleAsignarRepuesto = async () => {
    if (!repuestoSeleccionado || cantidadRepuesto < 1) {
      showAlert("Selecciona un repuesto y cantidad válida", "warning");
      return;
    }

    try {
      // Obtenemos el usuario logueado (en un sistema real esto vendría del token/contexto)
      // Por ahora simulamos o buscamos el primer admin/usuario
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      await api.post("/repuestos/asignar", {
        repuesto_id: repuestoSeleccionado,
        maquina_id: id,
        usuario_id: user.id || 1, // Fallback si no hay login
        cantidad: parseInt(cantidadRepuesto),
        observacion: `Asignado a máquina ${maquina.codigo}`
      });

      showAlert("Repuesto asignado correctamente ✅", "success");
      setRepuestoSeleccionado("");
      setCantidadRepuesto(1);
      cargarMaquina();
      cargarRepuestos();
    } catch (err) {
      showAlert(err.response?.data?.error || "Error al asignar repuesto", "error");
    }
  };

  // 🔎 filtro técnicos
  useEffect(() => {
    if (!busqueda) return setFiltrados([]);

    setFiltrados(
      usuarios.filter(u =>
        (u.nombre || "").toLowerCase().includes(busqueda.toLowerCase())
      )
    );
  }, [busqueda, usuarios]);

  // 🛠️ crear mantenimiento
  const crearMantenimiento = async (e) => {
    e.preventDefault();

    if (!descripcion.trim() || seleccionados.length === 0) {
      showAlert("Faltan datos", "warning");
      return;
    }

    try {
      await api.post("/mantenimiento", {
        descripcion,
        maquinas_id: id,
        usuarios_id: seleccionados.map(u => u.id)
      });

      await cargarMaquina();

      setDescripcion("");
      setSeleccionados([]);
      setBusqueda("");

    } catch (err) {
      console.log(err);
      showAlert("Error guardando", "error");
    }
  };

  // 🗑️ eliminar máquina
  const handleEliminarMaquinaClick = async () => {
    const isConfirmed = await showConfirm("Esta acción no se puede deshacer y borrará todo su historial.", "¿Eliminar máquina?");
    if (!isConfirmed) return;

    try {
      await api.delete(`/maquinas/${id}`);
      showAlert("Máquina eliminada", "success");
      navigate("/dashboard");
    } catch (err) {
      console.log(err);
      showAlert("Error eliminando la máquina", "error");
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin shadow-lg shadow-blue-500/20" />
    </div>
  );
  
  if (!maquina) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white">
      Error cargando máquina
    </div>
  );

  const inputClass = "w-full p-2.5 bg-slate-800/80 border border-slate-700 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm text-white placeholder:text-slate-500 outline-none";

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans relative overflow-hidden p-4 sm:p-8">
      {/* Background ambient gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/10 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="max-w-3xl mx-auto bg-slate-800/40 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-2xl border border-slate-700/50 relative z-10">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-slate-700/50 pb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 bg-slate-900/50 backdrop-blur-md rounded-xl shadow-sm border border-slate-700/50 hover:text-blue-400 text-slate-400 transition"
            >
              <ChevronLeft size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
                Máquina {maquina.codigo}
              </h1>
              <p className="text-slate-400 text-sm font-mono tracking-widest mt-1">ID: {String(maquina.id).slice(0, 8)}</p>
            </div>
          </div>

          <button
            onClick={handleEliminarMaquinaClick}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-red-600/20 transition-all text-sm"
          >
            <Trash2 size={18} /> Eliminar
          </button>
        </div>

        {/* INFO */}
        <div className="bg-slate-900/50 p-6 rounded-2xl mb-8 border border-slate-700/50 shadow-inner grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-slate-800 rounded-lg text-slate-400"><Cpu size={18} /></div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Serial Máquina</p>
              <p className="text-slate-300 font-mono font-medium">{maquina.serial_maquina || "N/A"}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-slate-800 rounded-lg text-slate-400"><Cpu size={18} /></div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                {maquina.serial_billetero_2 ? "Serial Billetero 1" : "Serial Billetero"}
              </p>
              <p className="text-slate-300 font-mono font-medium">{maquina.serial_billetero_1 || maquina.serial_billetero || "N/A"}</p>
            </div>
          </div>
          {maquina.serial_billetero_2 && (
            <div className="flex items-start gap-3">
              <div className="p-2 bg-slate-800 rounded-lg text-slate-400"><Cpu size={18} /></div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Serial Billetero 2</p>
                <p className="text-slate-300 font-mono font-medium">{maquina.serial_billetero_2}</p>
              </div>
            </div>
          )}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-slate-800 rounded-lg text-slate-400"><AlertTriangle size={18} /></div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Estado</p>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border
                ${maquina.estado === "funcional" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}
              `}>
                <span className={`w-1.5 h-1.5 rounded-full ${maquina.estado === "funcional" ? "bg-emerald-400" : "bg-red-400"}`} />
                {maquina.estado}
              </span>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-slate-800 rounded-lg text-slate-400"><Search size={18} /></div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Localidad</p>
              <p className="text-slate-300 font-medium">{maquina.localidad}</p>
            </div>
          </div>
        </div>

        {/* FORM */}
        <form onSubmit={crearMantenimiento} className="mb-8 p-6 border border-slate-700/50 rounded-2xl bg-slate-900/30 shadow-inner">
          <h2 className="font-extrabold text-white mb-5 flex items-center gap-2">
            <div className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
              <Plus size={18} />
            </div>
            Registrar Intervención
          </h2>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Descripción del mantenimiento..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className={inputClass}
            />

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="text"
                placeholder="Buscar técnico para asignar..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className={`${inputClass} pl-10`}
              />
              
              {filtrados.length > 0 && (
                <div className="absolute z-20 w-full mt-2 bg-slate-800 border border-slate-600 rounded-xl shadow-xl overflow-hidden max-h-40 overflow-y-auto">
                  {filtrados.map(u => (
                    <div
                      key={u.id}
                      onClick={() => {
                        if (!seleccionados.find(s => s.id === u.id)) {
                          setSeleccionados([...seleccionados, u]);
                        }
                        setBusqueda("");
                      }}
                      className="cursor-pointer hover:bg-slate-700 px-4 py-2.5 text-sm text-slate-300 transition-colors flex items-center gap-2"
                    >
                      <User size={14} className="text-blue-400" />
                      {u.nombre}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {seleccionados.length > 0 && (
              <div className="flex gap-2 flex-wrap mt-3 bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">
                {seleccionados.map(u => (
                  <span
                    key={u.id}
                    onClick={() => setSeleccionados(seleccionados.filter(x => x.id !== u.id))}
                    className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-xl cursor-pointer hover:bg-red-600 transition-colors text-xs font-bold shadow-sm"
                    title="Remover"
                  >
                    {u.nombre} <X size={14} />
                  </span>
                ))}
              </div>
            )}

            <button className="w-full mt-2 bg-green-500 text-white p-2.5 rounded-xl font-bold hover:bg-green-600 transition-all shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 text-sm">
              <Save size={18} /> Guardar Mantenimiento
            </button>
          </div>
        </form>

        {/* 📦 REPUESTOS USADOS EN ESTA MÁQUINA */}
        <section className="mb-8">
          <h2 className="text-xl font-extrabold text-white mb-4 flex items-center gap-2">
            <Package size={22} className="text-indigo-400" />
            Repuestos Instalados
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {maquina.repuestos?.length > 0 ? (
              maquina.repuestos.map((r) => (
                <div key={r.id} className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50 flex justify-between items-center group hover:bg-slate-800/60 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400"><Package size={18} /></div>
                    <div>
                      <p className="text-sm font-bold text-white">{r.repuestos?.nombre}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{r.repuestos?.codigo}</p>
                    </div>
                  </div>
                    <div className="text-right">
                      <span className="text-lg font-black text-indigo-400">x{r.cantidad}</span>
                      <p className="text-[9px] text-slate-500">{new Date(r.fecha).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-8 text-center bg-slate-900/20 rounded-2xl border border-dashed border-slate-700/50">
                  <p className="text-slate-600 text-sm font-medium">No se han registrado repuestos en esta máquina.</p>
                </div>
              )}
          </div>

          {/* Formulario rápido para asignar repuesto */}
          <div className="bg-slate-800/20 p-4 rounded-2xl border border-slate-700/30">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Plus size={14} /> Asignar Nuevo Repuesto
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <select 
                className={`${inputClass} sm:w-2/3`}
                onChange={(e) => setRepuestoSeleccionado(e.target.value)}
                value={repuestoSeleccionado}
              >
                <option value="">Seleccionar repuesto...</option>
                {repuestosDisponibles.map(r => (
                  <option key={r.id} value={r.id}>{r.nombre} ({r.stock_actual} disp.)</option>
                ))}
              </select>
              <input 
                type="number" 
                placeholder="Cant." 
                className={`${inputClass} sm:w-1/4`} 
                value={cantidadRepuesto}
                onChange={(e) => setCantidadRepuesto(e.target.value)}
              />
              <button 
                onClick={handleAsignarRepuesto}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-600/20"
              >
                Asignar
              </button>
            </div>
          </div>
        </section>

        {/* HISTORIAL */}
        <h2 className="text-xl font-extrabold text-white mb-4 flex items-center gap-2">
          <HistoryIcon size={22} className="text-blue-400" />
          Historial de Intervenciones
        </h2>

        <div className="max-h-80 overflow-y-auto border border-slate-700/50 rounded-2xl p-4 bg-slate-900/30 shadow-inner space-y-3 custom-scrollbar">
          {(!maquina.mantenimientos || maquina.mantenimientos.length === 0) && (
            <div className="text-center py-10 text-slate-500">
              <Wrench size={32} className="mx-auto mb-3 opacity-50" />
              <p className="font-medium text-sm">No hay mantenimientos registrados</p>
            </div>
          )}

          {maquina.mantenimientos?.map((m) => (
            <div key={m.id} className="p-4 border border-slate-700/50 rounded-xl bg-slate-800/50 hover:bg-slate-800/80 transition-colors">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-2 bg-slate-900/50 inline-flex px-2 py-1 rounded-lg">
                <Calendar size={14} className="text-blue-400" />
                {new Date(m.fecha).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
              </div>

              <p className="font-medium text-slate-200 text-sm mb-3 pl-1 border-l-2 border-blue-500 ml-1">{m.descripcion}</p>

              <div className="flex flex-wrap gap-1.5">
                {m.usuarios?.length > 0 ? (
                  m.usuarios.map((u, i) => (
                    <span key={i} className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-900/50 border border-slate-700/50 px-2 py-1 rounded-lg">
                      <User size={10} className="text-blue-400" />
                      {u}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic ml-1">Sin técnicos asignados</span>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}
