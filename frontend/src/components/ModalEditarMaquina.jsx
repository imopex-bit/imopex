import { useEffect, useState } from "react";
import api from "../api";

export default function ModalEditarMaquina({ maquina, onClose, onUpdated }) {

  const [estado, setEstado] = useState("");
  const [localidades, setLocalidades] = useState([]);

  const [localidad, setLocalidad] = useState("");
  const [nuevaLocalidad, setNuevaLocalidad] = useState("");
  const [mostrarNuevaLocalidad, setMostrarNuevaLocalidad] = useState(false);

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
        setLocalidades([...new Set(data.map(m => m.localidad))]);
      } catch (error) {
        console.log(error);
        alert("Error cargando localidades ❌");
      } finally {
        setLoading(false);
      }
    };

    cargarLocalidades();

  }, [maquina]);

  // 🔥 guardar
  const guardar = async () => {

    const finalLocalidad = mostrarNuevaLocalidad
      ? nuevaLocalidad.trim()
      : localidad;

    if (!estado) return alert("Selecciona estado ❌");
    if (!finalLocalidad) return alert("Selecciona ubicación ❌");

    try {
      await api.put(`/maquinas/${maquina.id}`, {
        estado,
        localidad: finalLocalidad,
        descripcion: descripcion.trim()
      });

      onUpdated();
      onClose();

    } catch (error) {
      console.log(error);
      alert("Error actualizando ❌");
    }
  };

  if (!maquina) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">

      <div className="bg-white w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl">

        {/* HEADER */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-bold">
            Editar Máquina {maquina.codigo}
          </h2>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 text-xl"
          >
            ✖
          </button>
        </div>

        {/* BODY */}
        <div className="p-4 space-y-3">

          {/* ESTADO */}
          <div>
            <label className="text-sm font-semibold">Estado</label>

            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="w-full border p-2 rounded"
            >
              <option value="">Seleccionar</option>
              <option value="funcional">Funcional</option>
              <option value="no funcional">No funcional</option>
            </select>
          </div>

          {/* UBICACIÓN */}
          <div>
            <label className="text-sm font-semibold">Ubicación</label>

            <select
              value={localidad}
              onChange={(e) => {
                setLocalidad(e.target.value);
                setMostrarNuevaLocalidad(false);
                setNuevaLocalidad("");
              }}
              disabled={mostrarNuevaLocalidad}
              className="w-full border p-2 rounded"
            >
              <option value="">Seleccionar ubicación</option>

              {localidades.map((l, i) => (
                <option key={i} value={l}>{l}</option>
              ))}
            </select>

            <button
              onClick={() => {
                setMostrarNuevaLocalidad(!mostrarNuevaLocalidad);
                setLocalidad("");
              }}
              className="text-blue-500 text-sm mt-1"
            >
              + Nueva ubicación
            </button>

            {mostrarNuevaLocalidad && (
              <input
                placeholder="Nueva ubicación..."
                value={nuevaLocalidad}
                onChange={(e) => {
                  setNuevaLocalidad(e.target.value);
                  setLocalidad("");
                }}
                className="w-full border p-2 rounded mt-2"
              />
            )}
          </div>

          {/* DESCRIPCIÓN */}
          <div>
            <label className="text-sm font-semibold">Descripción</label>

            <textarea
              placeholder="Descripción..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>

        </div>

        {/* FOOTER */}
        <div className="p-4 border-t flex gap-2">

          <button
            onClick={onClose}
            className="w-full bg-gray-300 py-2 rounded"
          >
            ✖ Cancelar
          </button>

          <button
            onClick={guardar}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            Guardar cambios
          </button>

        </div>

      </div>
    </div>
  );
}