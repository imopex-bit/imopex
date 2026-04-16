import { useEffect, useState } from "react";
import api from "../api";

export default function ModalEditarMaquina({ maquina, onClose, onUpdated }) {

  const [estado, setEstado] = useState("");
  const [localidades, setLocalidades] = useState([]);

  const [localidad, setLocalidad] = useState("");
  const [nuevaLocalidad, setNuevaLocalidad] = useState("");
  const [usarNueva, setUsarNueva] = useState(false);

  const [descripcion, setDescripcion] = useState("");

  const [loading, setLoading] = useState(true);

  // 🔹 cargar datos
  useEffect(() => {
    if (!maquina) return;

    setEstado(maquina.estado || "");
    setLocalidad(maquina.localidad || "");
    setDescripcion(maquina.descripcion || "");

    const cargarLocalidades = async () => {
      try {
        const data = await api.get("/maquinas");

        const unicas = [...new Set(data.map(m => m.localidad))];
        setLocalidades(unicas);

      } catch (error) {
        console.log("ERROR:", error);
        alert(error.message || "Error cargando localidades ❌");
      } finally {
        setLoading(false);
      }
    };

    cargarLocalidades();

  }, [maquina]);

  // 🔥 guardar cambios
  const guardar = async () => {

    const finalLocalidad = usarNueva ? nuevaLocalidad.trim() : localidad;

    if (!estado) return alert("Selecciona estado ❌");
    if (!finalLocalidad) return alert("Selecciona ubicación ❌");

    try {
      await api.put(`/maquinas/${maquina.id}`, {
        estado,
        localidad: finalLocalidad,
        descripcion: descripcion.trim()
      });

      alert("Actualizado ✅");

      onUpdated();
      onClose();

    } catch (error) {
      console.log("ERROR ACTUALIZANDO:", error);
      alert(error.message || "Error actualizando ❌");
    }
  };

  if (!maquina) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">

      <div className="bg-white w-full max-w-xl p-6 rounded-xl shadow-xl">

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            Editar Máquina {maquina.codigo}
          </h2>

          <button onClick={onClose} className="text-gray-500 text-lg">
            ✖
          </button>
        </div>

        {loading ? (
          <p className="text-center">Cargando...</p>
        ) : (
          <>
            <label className="block mb-1 font-semibold">Estado</label>

            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="w-full border p-2 rounded mb-3"
            >
              <option value="">Seleccionar</option>
              <option value="funcional">Funcional</option>
              <option value="no funcional">No funcional</option>
            </select>

            <label className="block mb-1 font-semibold">Ubicación</label>

            <select
              value={usarNueva ? "nueva" : localidad}
              onChange={(e) => {
                if (e.target.value === "nueva") {
                  setUsarNueva(true);
                  setLocalidad("");
                } else {
                  setUsarNueva(false);
                  setLocalidad(e.target.value);
                }
              }}
              className="w-full border p-2 rounded mb-2"
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
                onChange={(e) => setNuevaLocalidad(e.target.value)}
                className="w-full border p-2 rounded mb-3"
              />
            )}

            <label className="block mb-1 font-semibold">Descripción</label>

            <textarea
              placeholder="Descripción..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full border p-2 rounded mb-3"
            />

            <button
              onClick={guardar}
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            >
              Guardar cambios
            </button>
          </>
        )}

      </div>
    </div>
  );
}