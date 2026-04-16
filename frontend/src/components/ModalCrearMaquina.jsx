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

  // 🔹 cargar datos
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

  // 🔥 guardar
  const guardar = async () => {

    const tipoFinal = mostrarNuevoTipo ? nuevoTipo.trim() : tipo;
    const localidadFinal = mostrarNuevaLocalidad ? nuevaLocalidad.trim() : localidad;

    if (!codigo.trim() || !serialMaquina.trim() || !serialBilletero.trim()) {
      return alert("Completa todos los campos ❌");
    }

    if (!tipoFinal || !estado || !localidadFinal) {
      return alert("Faltan datos ❌");
    }

    try {
      setLoading(true);

      await api.post("/maquinas", {
        codigo: codigo.trim(),
        serial_maquina: serialMaquina.trim(),
        serial_billetero: serialBilletero.trim(),
        tipo_maquina: tipoFinal,
        estado,
        localidad: localidadFinal,
        descripcion: descripcion.trim()
      });

      onCreated();
      onClose();

    } catch (error) {
      alert(error.message || "Error creando ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">

      {/* 🔥 MODAL MÁS PEQUEÑO Y CON SCROLL */}
      <div className="bg-white w-full max-w-md max-h-[90vh] overflow-y-auto p-5 rounded-xl shadow-xl">

        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold">➕ Nueva Máquina</h2>
          <button onClick={onClose}>✖</button>
        </div>

        <input
          placeholder="Código"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          className="w-full border p-2 rounded mb-2"
        />

        <input
          placeholder="Serial máquina"
          value={serialMaquina}
          onChange={(e) => setSerialMaquina(e.target.value)}
          className="w-full border p-2 rounded mb-2"
        />

        <input
          placeholder="Serial billetero"
          value={serialBilletero}
          onChange={(e) => setSerialBilletero(e.target.value)}
          className="w-full border p-2 rounded mb-2"
        />

        <textarea
          placeholder="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className="w-full border p-2 rounded mb-3"
        />

        {/* 🔥 TIPO MEJORADO */}
        <label className="text-sm font-semibold">Tipo</label>

        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="w-full border p-2 rounded mb-2"
        >
          <option value="">Seleccionar tipo</option>
          {tipos.map((t, i) => (
            <option key={i} value={t}>{t}</option>
          ))}
        </select>

        <button
          onClick={() => setMostrarNuevoTipo(!mostrarNuevoTipo)}
          className="text-blue-500 text-sm mb-2"
        >
          ➕ Agregar nuevo tipo
        </button>

        {mostrarNuevoTipo && (
          <input
            placeholder="Nuevo tipo..."
            value={nuevoTipo}
            onChange={(e) => setNuevoTipo(e.target.value)}
            className="w-full border p-2 rounded mb-3"
          />
        )}

        {/* 🔥 ESTADO */}
        <label className="text-sm font-semibold">Estado</label>

        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          className="w-full border p-2 rounded mb-3"
        >
          <option value="">Seleccionar estado</option>
          <option value="funcional">Funcional</option>
          <option value="no funcional">No funcional</option>
        </select>

        {/* 🔥 UBICACIÓN MEJORADA */}
        <label className="text-sm font-semibold">Ubicación</label>

        <select
          value={localidad}
          onChange={(e) => setLocalidad(e.target.value)}
          className="w-full border p-2 rounded mb-2"
        >
          <option value="">Seleccionar ubicación</option>
          {localidades.map((l, i) => (
            <option key={i} value={l}>{l}</option>
          ))}
        </select>

        <button
          onClick={() => setMostrarNuevaLocalidad(!mostrarNuevaLocalidad)}
          className="text-blue-500 text-sm mb-2"
        >
          ➕ Agregar nueva ubicación
        </button>

        {mostrarNuevaLocalidad && (
          <input
            placeholder="Nueva ubicación..."
            value={nuevaLocalidad}
            onChange={(e) => setNuevaLocalidad(e.target.value)}
            className="w-full border p-2 rounded mb-3"
          />
        )}

        <button
          onClick={guardar}
          disabled={loading}
          className="w-full bg-green-500 text-white py-2 rounded"
        >
          {loading ? "Creando..." : "Crear máquina"}
        </button>

      </div>
    </div>
  );
}