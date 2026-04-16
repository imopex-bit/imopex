import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api"; // ✅ IMPORT CORRECTO

export default function CrearMaquina() {
  const navigate = useNavigate();

  const [codigo, setCodigo] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const [serialMaquina, setSerialMaquina] = useState("");
  const [serialBilletero, setSerialBilletero] = useState("");

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
    if (!serialBilletero) nuevosErrores.serialBilletero = true;
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
        serial_billetero: serialBilletero,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">

      <form
        onSubmit={guardar}
        className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md"
      >

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-blue-500 mb-3 hover:underline"
        >
          ← Volver
        </button>

        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          ➕ Añadir máquina
        </h2>

        <input
          placeholder="Código"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          className="w-full p-2 mb-3 border rounded"
        />

        <input
          placeholder="Serial Máquina"
          value={serialMaquina}
          onChange={(e) => setSerialMaquina(e.target.value)}
          className="w-full p-2 mb-3 border rounded"
        />

        <input
          placeholder="Serial Billetero"
          value={serialBilletero}
          onChange={(e) => setSerialBilletero(e.target.value)}
          className="w-full p-2 mb-3 border rounded"
        />

        <textarea
          placeholder="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className="w-full p-2 mb-3 border rounded"
        />

        {/* TIPO */}
        <select
          value={tipo}
          onChange={(e) => {
            setTipo(e.target.value);
            setNuevoTipo("");
          }}
          className="w-full p-2 mb-2 border rounded"
        >
          <option value="">Seleccionar tipo</option>
          {tipos.map((t, i) => (
            <option key={i} value={t}>{t}</option>
          ))}
        </select>

        <input
          placeholder="Nuevo tipo..."
          value={nuevoTipo}
          onChange={(e) => {
            setNuevoTipo(e.target.value);
            setTipo("");
          }}
          className="w-full p-2 mb-3 border rounded"
        />

        {/* ESTADO */}
        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          className="w-full p-2 mb-3 border rounded"
        >
          <option value="">Estado</option>
          <option value="funcional">Funcional</option>
          <option value="no funcional">No funcional</option>
        </select>

        {/* LOCALIDAD */}
        <select
          value={localidad}
          onChange={(e) => {
            setLocalidad(e.target.value);
            setNuevaLocalidad("");
          }}
          className="w-full p-2 mb-2 border rounded"
        >
          <option value="">Seleccionar localidad</option>
          {localidades.map((l, i) => (
            <option key={i} value={l}>{l}</option>
          ))}
        </select>

        <input
          placeholder="Nueva localidad..."
          value={nuevaLocalidad}
          onChange={(e) => {
            setNuevaLocalidad(e.target.value);
            setLocalidad("");
          }}
          className="w-full p-2 mb-4 border rounded"
        />

        <button
          disabled={loading}
          className="w-full bg-green-500 text-white p-2 rounded"
        >
          {loading ? "Guardando..." : "Guardar"}
        </button>

      </form>
    </div>
  );
}
