import { useEffect, useState } from "react";
import api from "../api";

export default function ModalCrearMaquina({ onClose, onCreated }) {

  const [codigo, setCodigo] = useState("");
  const [serialMaquina, setSerialMaquina] = useState("");
  const [serialBilletero, setSerialBilletero] = useState("");
  const [estado, setEstado] = useState("");

  const [tipos, setTipos] = useState([]);
  const [tipo, setTipo] = useState("");
  const [nuevoTipo, setNuevoTipo] = useState("");
  const [mostrarNuevoTipo, setMostrarNuevoTipo] = useState(false);

  const [localidades, setLocalidades] = useState([]);
  const [localidad, setLocalidad] = useState("");
  const [nuevaLocalidad, setNuevaLocalidad] = useState("");
  const [mostrarNuevaLocalidad, setMostrarNuevaLocalidad] = useState(false);

  const [descripcion, setDescripcion] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await api.get("/maquinas");
        setTipos([...new Set(data.map(m => m.tipo_maquina))]);
        setLocalidades([...new Set(data.map(m => m.localidad))]);
      } catch {
        alert("Error cargando datos ❌");
      }
    };
    cargar();
  }, []);

  const guardar = async () => {
    const tipoFinal = mostrarNuevoTipo ? nuevoTipo.trim() : tipo;
    const localidadFinal = mostrarNuevaLocalidad ? nuevaLocalidad.trim() : localidad;

    if (!codigo || !serialMaquina || !serialBilletero) {
      return alert("Completa los campos ❌");
    }

    if (!tipoFinal || !estado || !localidadFinal) {
      return alert("Faltan datos ❌");
    }

    try {
      setLoading(true);

      await api.post("/maquinas", {
        codigo,
        serial_maquina: serialMaquina,
        serial_billetero: serialBilletero,
        tipo_maquina: tipoFinal,
        estado,
        localidad: localidadFinal,
        descripcion
      });

      onCreated();
      onClose();

    } catch {
      alert("Error creando ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">

      <div className="bg-white w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl">

        {/* HEADER */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-bold">Nueva Máquina</h2>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 text-xl"
          >
            ✖
          </button>
        </div>

        {/* BODY */}
        <div className="p-4 space-y-3">

          <input
            placeholder="Código"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            className="w-full border p-2 rounded"
          />

          <input
            placeholder="Serial máquina"
            value={serialMaquina}
            onChange={(e) => setSerialMaquina(e.target.value)}
            className="w-full border p-2 rounded"
          />

          <input
            placeholder="Serial billetero"
            value={serialBilletero}
            onChange={(e) => setSerialBilletero(e.target.value)}
            className="w-full border p-2 rounded"
          />

          <textarea
            placeholder="Descripción"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="w-full border p-2 rounded"
          />

          {/* TIPO */}
          <div>
            <label className="text-sm font-semibold">Tipo</label>

            <select
              value={tipo}
              onChange={(e) => {
                setTipo(e.target.value);
                setMostrarNuevoTipo(false);
              }}
              disabled={mostrarNuevoTipo}
              className="w-full border p-2 rounded"
            >
              <option value="">Seleccionar tipo</option>
              {tipos.map((t, i) => (
                <option key={i}>{t}</option>
              ))}
            </select>

            <button
              onClick={() => {
                setMostrarNuevoTipo(!mostrarNuevoTipo);
                setTipo("");
              }}
              className="text-blue-500 text-sm mt-1"
            >
              + Nuevo tipo
            </button>

            {mostrarNuevoTipo && (
              <input
                placeholder="Nuevo tipo..."
                value={nuevoTipo}
                onChange={(e) => setNuevoTipo(e.target.value)}
                className="w-full border p-2 rounded mt-2"
              />
            )}
          </div>

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
              }}
              disabled={mostrarNuevaLocalidad}
              className="w-full border p-2 rounded"
            >
              <option value="">Seleccionar ubicación</option>
              {localidades.map((l, i) => (
                <option key={i}>{l}</option>
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
                onChange={(e) => setNuevaLocalidad(e.target.value)}
                className="w-full border p-2 rounded mt-2"
              />
            )}
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
            disabled={loading}
            className="w-full bg-green-500 text-white py-2 rounded flex items-center justify-center gap-1"
          >
            {loading ? "..." : "+ Crear"}
          </button>

        </div>

      </div>
    </div>
  );
}