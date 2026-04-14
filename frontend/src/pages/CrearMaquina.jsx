import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = "https://imopex.onrender.com";

export default function CrearMaquina() {
  const navigate = useNavigate();

  const [codigo, setCodigo] = useState("");
  const [descripcion, setDescripcion] = useState("");

  // 🔥 NUEVOS
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

  // 🔹 cargar datos existentes
  useEffect(() => {
    const cargar = async () => {
      const res = await fetch(`${API}/maquinas`);
      const data = await res.json();

      setTipos([...new Set(data.map(m => m.tipo_maquina))]);
      setLocalidades([...new Set(data.map(m => m.localidad))]);
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
      const res = await fetch(`${API}/maquinas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          codigo,
          descripcion,
          serial_maquina: serialMaquina,
          serial_billetero: serialBilletero,
          tipo_maquina: tipoFinal,
          estado,
          localidad: localidadFinal
        })
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error || "Error guardando ❌");
        return;
      }

      navigate("/dashboard");

    } catch {
      alert("Error guardando ❌");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">

      <form
        onSubmit={guardar}
        className="bg-white p-6 rounded-xl shadow w-full max-w-md"
      >

        {/* 🔙 VOLVER */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-blue-500 mb-3"
        >
          ← Volver
        </button>

        <h2 className="text-2xl font-bold mb-4">
          ➕ Añadir máquina
        </h2>

        {/* CÓDIGO */}
        <input
          placeholder="Código"
          value={codigo}
          onChange={(e) => {
            setCodigo(e.target.value);
            setErrores({ ...errores, codigo: false });
          }}
          className={`w-full p-2 mb-3 border rounded ${
            errores.codigo ? "border-red-500" : ""
          }`}
        />

        {/* 🔥 SERIAL MÁQUINA */}
        <input
          placeholder="Serial Máquina"
          value={serialMaquina}
          onChange={(e) => {
            setSerialMaquina(e.target.value);
            setErrores({ ...errores, serialMaquina: false });
          }}
          className={`w-full p-2 mb-3 border rounded ${
            errores.serialMaquina ? "border-red-500" : ""
          }`}
        />

        {/* 🔥 SERIAL BILLETERO */}
        <input
          placeholder="Serial Billetero"
          value={serialBilletero}
          onChange={(e) => {
            setSerialBilletero(e.target.value);
            setErrores({ ...errores, serialBilletero: false });
          }}
          className={`w-full p-2 mb-3 border rounded ${
            errores.serialBilletero ? "border-red-500" : ""
          }`}
        />

        {/* DESCRIPCIÓN */}
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
            setErrores({ ...errores, tipo: false });
          }}
          className={`w-full p-2 mb-2 border rounded ${
            errores.tipo ? "border-red-500" : ""
          }`}
        >
          <option value="">Seleccionar tipo</option>
          {tipos.map((t, i) => (
            <option key={i}>{t}</option>
          ))}
        </select>

        <input
          placeholder="O escribir nuevo tipo..."
          value={nuevoTipo}
          onChange={(e) => {
            setNuevoTipo(e.target.value);
            setTipo("");
            setErrores({ ...errores, tipo: false });
          }}
          className="w-full p-2 mb-3 border rounded"
        />

        {/* ESTADO */}
        <select
          value={estado}
          onChange={(e) => {
            setEstado(e.target.value);
            setErrores({ ...errores, estado: false });
          }}
          className={`w-full p-2 mb-3 border rounded ${
            errores.estado ? "border-red-500" : ""
          }`}
        >
          <option value="">Estado</option>
          <option value="Activo">Activo</option>
          <option value="Inactivo">Inactivo</option>
          <option value="Mantenimiento">Mantenimiento</option>
        </select>

        {/* LOCALIDAD */}
        <select
          value={localidad}
          onChange={(e) => {
            setLocalidad(e.target.value);
            setNuevaLocalidad("");
            setErrores({ ...errores, localidad: false });
          }}
          className={`w-full p-2 mb-2 border rounded ${
            errores.localidad ? "border-red-500" : ""
          }`}
        >
          <option value="">Seleccionar localidad</option>
          {localidades.map((l, i) => (
            <option key={i}>{l}</option>
          ))}
        </select>

        <input
          placeholder="O escribir nueva localidad..."
          value={nuevaLocalidad}
          onChange={(e) => {
            setNuevaLocalidad(e.target.value);
            setLocalidad("");
            setErrores({ ...errores, localidad: false });
          }}
          className="w-full p-2 mb-4 border rounded"
        />

        {/* BOTÓN */}
        <button className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600">
          Guardar
        </button>

      </form>

    </div>
  );  
}