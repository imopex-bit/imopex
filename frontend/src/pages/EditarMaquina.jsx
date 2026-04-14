import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API = "https://imopex.onrender.com/api";

export default function EditarMaquina() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [maquina, setMaquina] = useState(null);

  const [estado, setEstado] = useState("");
  const [localidades, setLocalidades] = useState([]);
  const [localidad, setLocalidad] = useState("");
  const [nuevaLocalidad, setNuevaLocalidad] = useState("");
  const [usarNueva, setUsarNueva] = useState(false);

  // 🔥 ERRORES
  const [errorEstado, setErrorEstado] = useState(false);
  const [errorLocalidad, setErrorLocalidad] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await fetch(`${API}/maquinas/${id}`);
        const data = await res.json();

        setMaquina(data);
        setEstado(data.estado || "");
        setLocalidad(data.localidad || "");

        const res2 = await fetch(`${API}/maquinas`);
        const data2 = await res2.json();

        const unicas = [...new Set(data2.map(m => m.localidad))];
        setLocalidades(unicas);

      } catch {
        alert("Error cargando datos ❌");
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
      const res = await fetch(`${API}/maquinas/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          estado,
          localidad: finalLocalidad
        })
      });

      // 🔥 CLAVE: validar respuesta
      if (!res.ok) {
        throw new Error();
      }

      alert("Máquina actualizada ✅");

      navigate("/dashboard");

    } catch {
      alert("Error actualizando ❌");
    }
  };

  if (!maquina) return <p className="text-center mt-10">Cargando...</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow">

        <h1 className="text-xl font-bold mb-4">
          Editar Máquina {maquina.codigo}
        </h1>

        {/* ESTADO */}
        <label className="block mb-1">Estado</label>
        <select
          value={estado}
          onChange={(e) => {
            setEstado(e.target.value);
            setErrorEstado(false);
          }}
          className={`w-full p-2 border rounded mb-1 ${
            errorEstado ? "border-red-500" : ""
          }`}
        >
          <option value="">Seleccionar estado</option>
          <option value="funcional">Funcional</option>
          <option value="no funcional">No funcional</option>
        </select>

        {errorEstado && (
          <p className="text-red-500 text-xs mb-2">
            Selecciona un estado
          </p>
        )}

        {/* LOCALIDAD */}
        <label className="block mb-1 mt-3">Ubicación</label>

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
          className={`w-full p-2 border rounded mb-1 ${
            errorLocalidad ? "border-red-500" : ""
          }`}
        >
          <option value="">Seleccionar ubicación</option>

          {localidades.map((l, i) => (
            <option key={i} value={l}>{l}</option>
          ))}

          <option value="nueva">➕ Nueva ubicación</option>
        </select>

        {usarNueva && (
          <input
            type="text"
            placeholder="Nueva ubicación..."
            value={nuevaLocalidad}
            onChange={(e) => {
              setNuevaLocalidad(e.target.value);
              setErrorLocalidad(false);
            }}
            className={`w-full p-2 border rounded mb-1 ${
              errorLocalidad ? "border-red-500" : ""
            }`}
          />
        )}

        {errorLocalidad && (
          <p className="text-red-500 text-xs mb-2">
            Ingresa una ubicación válida
          </p>
        )}

        <button
          onClick={guardar}
          className="w-full bg-blue-500 text-white py-2 rounded mt-4 hover:bg-blue-600"
        >
          Guardar cambios
        </button>

      </div>
    </div>
  );
}