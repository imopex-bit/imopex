import { useState, useEffect, useMemo } from "react";
import {
  Users,
  Search,
  Plus,
  User,
  Phone,
  CreditCard,
  Briefcase,
  Edit3,
  Trash2,
  X,
  Save,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api";
import { useAlert } from "../context/AlertContext";

export default function Personal() {
  const { showAlert, showConfirm } = useAlert();
  const [personal, setPersonal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  // Modales
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTrabajador, setEditingTrabajador] = useState(null);

  // Form fields
  const [nombre, setNombre] = useState("");
  const [cedula, setCedula] = useState("");
  const [celular, setCelular] = useState("");
  const [cargo, setCargo] = useState("tecnico"); // 'tecnico', 'operador' o 'supervisor'

  // Cargar datos al montar
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);

        // 1. Obtener los datos frescos de la base de datos
        const respuesta = await api.get("/usuarios").catch(() => []);

        // CORRECCIÓN: Extraer los datos correctamente si usas Axios (.data)
        const dbUsers = respuesta?.data ? respuesta.data : (Array.isArray(respuesta) ? respuesta : []);

        // 2. Leer lo que tengamos en caché local para no perder los datos complementarios
        const cache = localStorage.getItem("cache_personal");
        const listaCache = cache ? JSON.parse(cache) : [];

        if (Array.isArray(dbUsers) && dbUsers.length > 0) {

          // 3. Mapear los usuarios de la BD fusionándolos con la cédula, celular y cargo guardados localmente
          const desdeDB = dbUsers.map(dbU => {
            // Buscamos si a este usuario de la BD ya le habíamos editado sus datos en esta máquina
            const usuarioEnCache = listaCache.find(c => c.id === dbU.id);

            return {
              id: dbU.id,
              nombre: dbU.nombre || "Sin nombre",
              // Si la BD no tiene el campo (como vimos en consola), lo extrae de lo que editaste localmente
              cedula: dbU.cedula || dbU.documento || dbU.cc || usuarioEnCache?.cedula || "",
              celular: dbU.celular || dbU.telefono || dbU.phone || usuarioEnCache?.celular || "",
              cargo: (dbU.cargo || dbU.rol || dbU.tipo_usuario || usuarioEnCache?.cargo || "tecnico").toLowerCase(),
              isDbUser: true
            };
          });

          // 4. Mantener también los usuarios creados 100% de forma local (los que inician con "loc-")
          const localPuros = listaCache.filter(lp => String(lp.id).startsWith("loc-"));

          const resultadoFinal = [...desdeDB, ...localPuros];
          setPersonal(resultadoFinal);

          // Guardamos en caché la estructura limpia
          localStorage.setItem("cache_personal", JSON.stringify(resultadoFinal));
        } else {
          // Sin conexión a la BD, usar caché local como fallback
          setPersonal(listaCache);
        }
      } catch (err) {
        console.error("ERROR CARGANDO PERSONAL:", err);
        const cache = localStorage.getItem("cache_personal");
        setPersonal(cache ? JSON.parse(cache) : []);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  // Filtrado por búsqueda
  const filtrados = useMemo(() => {
    if (!busqueda) return personal;
    return personal.filter(t =>
      t.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      t.cedula?.toLowerCase().includes(busqueda.toLowerCase()) ||
      t.cargo?.toLowerCase().includes(busqueda.toLowerCase())
    );
  }, [personal, busqueda]);

  // Abrir modal de creación
  const handleCrearClick = () => {
    setEditingTrabajador(null);
    setNombre("");
    setCedula("");
    setCelular("");
    setCargo("tecnico");
    setModalOpen(true);
  };

  // Abrir modal de edición
  const handleEditarClick = (t) => {
    setEditingTrabajador(t);
    setNombre(t.nombre);
    setCedula(t.cedula);
    setCelular(t.celular);
    setCargo(t.cargo);
    setModalOpen(true);
  };

  // Guardar (Crear o Editar) trabajador con Optimistic UI
  const handleGuardar = async (e) => {
    e.preventDefault();
    if (!nombre.trim() || !cedula.trim() || !celular.trim()) {
      showAlert("Por favor completa todos los campos obligatorios", "error");
      return;
    }

    let nuevas;
    if (editingTrabajador) {
      // Editar existente (sea de la BD o local)
      nuevas = personal.map(t =>
        t.id === editingTrabajador.id
          ? { ...t, nombre: nombre.trim(), cedula: cedula.trim(), celular: celular.trim(), cargo }
          : t
      );
      showAlert("Trabajador actualizado con éxito", "success");
    } else {
      // Crear nuevo puramente local
      const nuevo = {
        id: "loc-" + Date.now(),
        nombre: nombre.trim(),
        cedula: cedula.trim(),
        celular: celular.trim(),
        cargo,
        isDbUser: false
      };
      nuevas = [...personal, nuevo];
      showAlert("Trabajador registrado con éxito", "success");
    }

    setPersonal(nuevas);
    localStorage.setItem("cache_personal", JSON.stringify(nuevas));
    setModalOpen(false);
  };

  // Eliminar trabajador
  const handleEliminar = async (t) => {
    const isConfirmed = await showConfirm(
      `¿Estás seguro de eliminar a ${t.nombre}? Esta acción no se puede deshacer.`
    );
    if (!isConfirmed) return;

    const nuevas = personal.filter(item => item.id !== t.id);
    setPersonal(nuevas);
    localStorage.setItem("cache_personal", JSON.stringify(nuevas));
    showAlert("Trabajador eliminado exitosamente", "success");
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans relative overflow-hidden">

      {/* Background ambient gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/5 blur-[150px] rounded-full pointer-events-none z-0"></div>

      <div className="relative z-10 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-2xl text-white shadow-lg shadow-indigo-500/25">
              <Users size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight uppercase">Administración de Personal</h1>
              <p className="text-slate-400 text-sm mt-0.5">Control de técnicos, operadores y encargados de flota</p>
            </div>
          </div>

          <button
            onClick={handleCrearClick}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white rounded-2xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all text-sm font-bold hover:-translate-y-0.5 active:scale-95 shadow-md w-full md:w-auto justify-center"
          >
            <Plus size={18} />
            Agregar Trabajador
          </button>
        </div>

        {/* SEARCH & FILTER */}
        <div className="bg-slate-800/40 backdrop-blur-md p-4 rounded-2xl border border-slate-700/50 flex flex-col sm:flex-row items-center gap-4 w-full">
          <div className="relative w-full group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Buscar trabajador por nombre, cédula o cargo..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm text-white placeholder:text-slate-500 outline-none"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        {/* LOADING STATE */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 font-medium">Cargando personal técnico...</p>
          </div>
        ) : filtrados.length === 0 ? (
          <div className="bg-slate-800/20 rounded-2xl border border-slate-800/80 p-12 text-center max-w-lg mx-auto">
            <AlertCircle className="mx-auto text-slate-500 mb-4" size={40} />
            <h3 className="text-lg font-bold text-slate-300">No se encontró personal</h3>
            <p className="text-slate-500 text-sm mt-1">Intenta ajustando tu búsqueda o agrega un nuevo trabajador.</p>
          </div>
        ) : (
          /* CARD GRID */
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filtrados.map((t) => (
                <motion.div
                  key={t.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="bg-slate-800/40 backdrop-blur-md rounded-3xl p-6 border border-slate-700/50 shadow-xl hover:shadow-2xl hover:border-slate-600/50 transition-all flex flex-col justify-between group relative overflow-hidden"
                >
                  <div className="space-y-4">
                    {/* Header: Name and Role Tag */}
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl">
                          <User size={20} />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-white text-lg tracking-tight">{t.nombre}</h3>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mt-1 border ${t.cargo === "tecnico"
                              ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                              : t.cargo === "operador"
                                ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                                : t.cargo === "supervisor"
                                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                  : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                            }`}>
                            <Briefcase size={10} />
                            {t.cargo === "tecnico" ? "Técnico" : t.cargo === "operador" ? "Operador" : t.cargo === "supervisor" ? "Supervisor" : t.cargo}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Technical Fields */}
                    <div className="space-y-2 pt-2 border-t border-slate-700/30">
                      <div className="flex items-center gap-3 text-slate-300 text-xs">
                        <CreditCard size={14} className="text-slate-500" />
                        <span className="text-slate-400 font-bold">Cédula:</span>
                        <span className="font-mono text-slate-300">{t.cedula || "No registrada"}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-300 text-xs">
                        <Phone size={14} className="text-slate-500" />
                        <span className="text-slate-400 font-bold">Celular:</span>
                        {t.celular ? (
                          <a
                            href={`tel:${t.celular}`}
                            className="font-mono hover:text-indigo-400 transition-colors hover:underline text-slate-300"
                          >
                            {t.celular}
                          </a>
                        ) : (
                          <span className="text-slate-500 italic">No registrado</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-2.5 mt-6 pt-4 border-t border-slate-700/30">
                    <button
                      onClick={() => handleEditarClick(t)}
                      className="p-2 hover:bg-indigo-500/10 text-slate-400 hover:text-indigo-400 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleEliminar(t)}
                      className="p-2 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* MODAL CREAR / EDITAR */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-xl text-white">
                    <Users size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    {editingTrabajador ? "Editar Trabajador" : "Agregar Trabajador"}
                  </h2>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-2 hover:bg-slate-800 rounded-full transition text-slate-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleGuardar} className="p-6 space-y-4">
                {/* Nombre */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Nombre Completo</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-white outline-none"
                      placeholder="Ej. Juan Pérez"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Cédula */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Cédula / ID Nacional</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-white outline-none"
                      placeholder="Ej. 100234567"
                      value={cedula}
                      onChange={(e) => setCedula(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Celular */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Celular / Teléfono</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-white outline-none"
                      placeholder="Ej. 3001234567"
                      value={celular}
                      onChange={(e) => setCelular(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Cargo */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Cargo asignado</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <select
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-white outline-none cursor-pointer"
                      value={cargo}
                      onChange={(e) => setCargo(e.target.value)}
                    >
                      <option value="tecnico" className="bg-slate-900">Técnico</option>
                      <option value="operador" className="bg-slate-900">Operador</option>
                      <option value="supervisor" className="bg-slate-900">Supervisor</option>
                    </select>
                  </div>
                </div>

                {/* Submit Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700/80 text-slate-300 font-bold rounded-xl text-sm transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-bold rounded-xl text-sm transition hover:shadow-lg hover:shadow-indigo-500/20 flex items-center justify-center gap-2"
                  >
                    <Save size={16} />
                    Guardar
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}