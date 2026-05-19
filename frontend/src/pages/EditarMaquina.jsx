import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Edit3, Save, AlertCircle } from "lucide-react";
import api from "../api"; // ✅ IMPORT CORRECTO
import { useAlert } from "../context/AlertContext";

export default function EditarMaquina() {
  const { showAlert } = useAlert();

  const { id } = useParams();
  const navigate = useNavigate();

  const [maquina, setMaquina] = useState(null);

  const [estado, setEstado] = useState("");
  const [localidades, setLocalidades] = useState([]);
  const [localidad, setLocalidad] = useState("");
  const [nuevaLocalidad, setNuevaLocalidad] = useState("");
  const [usarNueva, setUsarNueva] = useState(false);

  const [serialMaquina, setSerialMaquina] = useState("");
  const [serialBilletero1, setSerialBilletero1] = useState("");
  const [serialBilletero2, setSerialBilletero2] = useState("");

  const [errorEstado, setErrorEstado] = useState(false);
  const [errorLocalidad, setErrorLocalidad] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        // 🔹 DETALLE
        const res = await api.get(`/maquinas/${id}`);
        const data = res.data || res;

        setMaquina(data);
        setEstado(data.estado || "");
        setLocalidad(data.localidad || "");
        setSerialMaquina(data.serial_maquina || "");
        setSerialBilletero1(data.serial_billetero_1 || data.serial_billetero || "");
        setSerialBilletero2(data.serial_billetero_2 || "");

        // 🔹 LISTA DE MÁQUINAS (para localidades)
        const res2 = await api.get("/maquinas");
        const lista = res2.data || res2;

        const unicas = [...new Set(lista.map(m => m.localidad).filter(Boolean))];
        setLocalidades(unicas);

      } catch (err) {
        console.log(err);
        showAlert("Error cargando datos", "error");
      }
    };

    cargar();
  }, [id]);

  const guardar = async () => {

    let hayError = false;

    if (!estado) {
      setErrorEstado(true);
      hayError = true;
    } else {
      setErrorEstado(false);
    }

    const finalLocalidad = usarNueva ? nuevaLocalidad : localidad;

    if (!finalLocalidad) {
      setErrorLocalidad(true);
      hayError = true;
    } else {
      setErrorLocalidad(false);
    }

    if (hayError) return;

    try {
      setLoading(true);
      await api.put(`/maquinas/${id}`, {
        estado,
        localidad: finalLocalidad,
        serial_maquina: serialMaquina,
        serial_billetero_1: serialBilletero1,
        serial_billetero_2: serialBilletero2
      });

      showAlert("Máquina actualizada ✅", "success");
      navigate("/dashboard");

    } catch (err) {
      console.log(err);
      showAlert("Error actualizando ❌", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!maquina) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin shadow-lg shadow-indigo-500/20" />
    </div>
  );

  const inputClass = "w-full p-2.5 bg-slate-900/50 border border-slate-700 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm text-white placeholder:text-slate-500 outline-none";
  const errorClass = "border-rose-500 focus:border-rose-500 focus:ring-rose-500 bg-rose-500/5";

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans relative overflow-hidden flex items-center justify-center p-4">
      
      {/* Background ambient gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/10 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="bg-slate-800/40 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-slate-700/50 w-full max-w-lg relative z-10">

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-slate-400 mb-6 hover:text-indigo-400 transition-colors text-sm font-medium"
        >
          <ChevronLeft size={18} /> Volver
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl shadow-inner">
            <Edit3 size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white leading-tight">
              Editar Máquina
            </h1>
            <p className="text-slate-400 text-sm font-medium tracking-wide">Código: <span className="text-indigo-400 font-bold">{maquina.codigo}</span></p>
          </div>
        </div>

        <div className="space-y-5">
          {/* SERIALES */}
          <div>
            <label className="block mb-2 text-sm font-bold text-slate-300">Serial Máquina</label>
            <input 
              value={serialMaquina}
              onChange={(e) => setSerialMaquina(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm font-bold text-slate-300">Billetero 1</label>
              <input 
                value={serialBilletero1}
                onChange={(e) => setSerialBilletero1(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-bold text-slate-300">Billetero 2 (Opcional)</label>
              <input 
                value={serialBilletero2}
                onChange={(e) => setSerialBilletero2(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* ESTADO */}
          <div>
            <label className="block mb-2 text-sm font-bold text-slate-300">Estado de la máquina</label>
            <select
              value={estado}
              onChange={(e) => {
                setEstado(e.target.value);
                setErrorEstado(false);
              }}
              className={`${inputClass} ${errorEstado ? errorClass : ""} appearance-none cursor-pointer`}
            >
              <option value="" className="bg-slate-800">Seleccionar estado</option>
              <option value="funcional" className="bg-slate-800">Funcional</option>
              <option value="no funcional" className="bg-slate-800">No funcional</option>
            </select>
            {errorEstado && (
              <p className="text-rose-400 text-xs mt-1.5 flex items-center gap-1 font-bold">
                <AlertCircle size={14} /> Selecciona un estado
              </p>
            )}
          </div>

          {/* LOCALIDAD */}
          <div>
            <label className="block mb-2 text-sm font-bold text-slate-300">Ubicación</label>
            <select
              value={usarNueva ? "nueva" : localidad}
              onChange={(e) => {
                if (e.target.value === "nueva") {
                  setUsarNueva(true);
                  setLocalidad("");
                } else {
                  setUsarNueva(false);
                  setLocalidad(e.target.value);
                  setErrorLocalidad(false);
                }
              }}
              className={`${inputClass} ${errorLocalidad && !usarNueva ? errorClass : ""} appearance-none cursor-pointer`}
            >
              <option value="" className="bg-slate-800">Seleccionar ubicación</option>
              {localidades.map((l, i) => (
                <option key={i} value={l} className="bg-slate-800">{l}</option>
              ))}
              <option value="nueva" className="bg-indigo-900 font-bold text-indigo-300">➕ Nueva ubicación...</option>
            </select>

            {usarNueva && (
              <input
                type="text"
                placeholder="Escribe la nueva ubicación..."
                value={nuevaLocalidad}
                onChange={(e) => {
                  setNuevaLocalidad(e.target.value);
                  setErrorLocalidad(false);
                }}
                className={`mt-3 ${inputClass} ${errorLocalidad ? errorClass : ""}`}
                autoFocus
              />
            )}

            {errorLocalidad && (
              <p className="text-rose-400 text-xs mt-1.5 flex items-center gap-1 font-bold">
                <AlertCircle size={14} /> Ingresa una ubicación válida
              </p>
            )}
          </div>
        </div>

        <button
          onClick={guardar}
          disabled={loading}
          className="mt-8 w-full bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <Save size={18} /> Guardar cambios
            </>
          )}
        </button>

      </div>
    </div>
  );
}
