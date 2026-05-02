import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Plus, Save, AlertCircle } from "lucide-react";
import api from "../api"; // ✅ IMPORT CORRECTO

export default function CrearMaquina() {
  const navigate = useNavigate();

  const [codigo, setCodigo] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const [serialMaquina, setSerialMaquina] = useState("");
  const [serialBilletero1, setSerialBilletero1] = useState("");
  const [serialBilletero2, setSerialBilletero2] = useState("");

  const [tipo, setTipo] = useState("");
  const [nuevoTipo, setNuevoTipo] = useState("");

  const [estado, setEstado] = useState("");

  const [localidad, setLocalidad] = useState("");
  const [nuevaLocalidad, setNuevaLocalidad] = useState("");

  const [tipos, setTipos] = useState([]);
  const [localidades, setLocalidades] = useState([]);

  const [errores, setErrores] = useState({});
  const [loading, setLoading] = useState(false);

  // 🔹 cargar datos
  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await api.get("/maquinas");
        const data = res.data || res;

        setTipos([...new Set(data.map(m => m.tipo_maquina).filter(Boolean))]);
        setLocalidades([...new Set(data.map(m => m.localidad).filter(Boolean))]);

      } catch (err) {
        console.log(err);
        alert("Error cargando datos ❌");
      }
    };

    cargar();
  }, []);

  // 🛠️ guardar
  const guardar = async (e) => {
    e.preventDefault();

    const tipoFinal = nuevoTipo || tipo;
    const localidadFinal = nuevaLocalidad || localidad;

    let nuevosErrores = {};

    if (!codigo) nuevosErrores.codigo = true;
    if (!serialMaquina) nuevosErrores.serialMaquina = true;
    if (!serialBilletero1) nuevosErrores.serialBilletero1 = true;
    if (!tipoFinal) nuevosErrores.tipo = true;
    if (!estado) nuevosErrores.estado = true;
    if (!localidadFinal) nuevosErrores.localidad = true;

    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    try {
      setLoading(true);

      await api.post("/maquinas", {
        codigo,
        descripcion,
        serial_maquina: serialMaquina,
        serial_billetero_1: serialBilletero1,
        serial_billetero_2: serialBilletero2,
        tipo_maquina: tipoFinal,
        estado,
        localidad: localidadFinal
      });

      navigate("/dashboard");

    } catch (err) {
      console.log(err);
      alert("Error guardando ❌");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full p-2.5 bg-slate-900/50 border border-slate-700 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm text-white placeholder:text-slate-500 outline-none";
  const errorClass = "border-rose-500 focus:border-rose-500 focus:ring-rose-500 bg-rose-500/5";

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans relative overflow-hidden flex items-center justify-center p-4">
      
      {/* Background ambient gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/10 blur-[150px] rounded-full pointer-events-none"></div>

      <form
        onSubmit={guardar}
        className="bg-slate-800/40 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-slate-700/50 w-full max-w-lg relative z-10"
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-slate-400 mb-6 hover:text-blue-400 transition-colors text-sm font-medium"
        >
          <ChevronLeft size={18} /> Volver
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl shadow-inner">
            <Plus size={24} />
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            Añadir Máquina
          </h2>
        </div>

        {Object.keys(errores).length > 0 && (
          <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl flex items-center gap-2 text-sm font-bold shadow-sm">
            <AlertCircle size={18} /> Por favor, completa todos los campos requeridos.
          </div>
        )}

        <div className="space-y-4">
          <div>
            <input
              placeholder="Código *"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              className={`${inputClass} ${errores.codigo ? errorClass : ""}`}
            />
          </div>

          <div className="space-y-4">
            <input
              placeholder="Serial Máquina *"
              value={serialMaquina}
              onChange={(e) => setSerialMaquina(e.target.value)}
              className={`${inputClass} ${errores.serialMaquina ? errorClass : ""}`}
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                placeholder="Serial Billetero 1 *"
                value={serialBilletero1}
                onChange={(e) => setSerialBilletero1(e.target.value)}
                className={`${inputClass} ${errores.serialBilletero1 ? errorClass : ""}`}
              />
              <input
                placeholder="Serial Billetero 2 (Opcional)"
                value={serialBilletero2}
                onChange={(e) => setSerialBilletero2(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <textarea
            placeholder="Descripción (opcional)"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className={`${inputClass} resize-none h-24`}
          />

          {/* TIPO */}
          <div className="grid grid-cols-2 gap-4">
            <select
              value={tipo}
              onChange={(e) => {
                setTipo(e.target.value);
                setNuevoTipo("");
              }}
              className={`${inputClass} ${errores.tipo && !nuevoTipo ? errorClass : ""} appearance-none cursor-pointer`}
            >
              <option value="" className="bg-slate-800">Seleccionar tipo...</option>
              {tipos.map((t, i) => (
                <option key={i} value={t} className="bg-slate-800">{t}</option>
              ))}
            </select>
            <input
              placeholder="O crear nuevo tipo..."
              value={nuevoTipo}
              onChange={(e) => {
                setNuevoTipo(e.target.value);
                setTipo("");
              }}
              className={`${inputClass} ${errores.tipo && !tipo ? errorClass : ""}`}
            />
          </div>

          {/* ESTADO */}
          <div>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className={`${inputClass} ${errores.estado ? errorClass : ""} appearance-none cursor-pointer`}
            >
              <option value="" className="bg-slate-800">Seleccionar estado...</option>
              <option value="funcional" className="bg-slate-800">Funcional</option>
              <option value="no funcional" className="bg-slate-800">No funcional</option>
            </select>
          </div>

          {/* LOCALIDAD */}
          <div className="grid grid-cols-2 gap-4">
            <select
              value={localidad}
              onChange={(e) => {
                setLocalidad(e.target.value);
                setNuevaLocalidad("");
              }}
              className={`${inputClass} ${errores.localidad && !nuevaLocalidad ? errorClass : ""} appearance-none cursor-pointer`}
            >
              <option value="" className="bg-slate-800">Seleccionar localidad...</option>
              {localidades.map((l, i) => (
                <option key={i} value={l} className="bg-slate-800">{l}</option>
              ))}
            </select>
            <input
              placeholder="O nueva localidad..."
              value={nuevaLocalidad}
              onChange={(e) => {
                setNuevaLocalidad(e.target.value);
                setLocalidad("");
              }}
              className={`${inputClass} ${errores.localidad && !localidad ? errorClass : ""}`}
            />
          </div>
        </div>

        <button
          disabled={loading}
          className="mt-8 w-full bg-green-500 hover:bg-green-600 text-white p-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <Save size={18} /> Guardar Máquina
            </>
          )}
        </button>

      </form>
    </div>
  );
}
