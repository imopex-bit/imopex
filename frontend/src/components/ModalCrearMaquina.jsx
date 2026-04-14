import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../api";

export default function ModalCrearMaquina({ onClose, onCreated }) {

  const [codigo, setCodigo] = useState("");
  const [serialMaquina, setSerialMaquina] = useState("");
  const [serialBilletero, setSerialBilletero] = useState("");

  const [estado, setEstado] = useState("");

  const [tipos, setTipos] = useState([]);
  const [tipo, setTipo] = useState("");
  const [nuevoTipo, setNuevoTipo] = useState("");
  const [usarNuevoTipo, setUsarNuevoTipo] = useState(false);

  const [localidades, setLocalidades] = useState([]);
  const [localidad, setLocalidad] = useState("");
  const [nuevaLocalidad, setNuevaLocalidad] = useState("");
  const [usarNuevaLocalidad, setUsarNuevaLocalidad] = useState(false);

  const [loading, setLoading] = useState(false);

  // 🔹 cargar datos existentes
  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await apiGet("/maquinas");

        const tiposUnicos = [...new Set(data.map(m => m.tipo_maquina))];
        const locUnicas = [...new Set(data.map(m => m.localidad))];

        setTipos(tiposUnicos);
        setLocalidades(locUnicas);
      } catch {
        alert("Error cargando datos ❌");
      }
    };

    cargar();
  }, []);

  // 🔥 guardar
  const guardar = async () => {

    const tipoFinal = usarNuevoTipo ? nuevoTipo.trim() : tipo;
    const localidadFinal = usarNuevaLocalidad ? nuevaLocalidad.trim() : localidad;

    if (!codigo.trim() || !serialMaquina.trim() || !serialBilletero.trim()) {
      return alert("Completa todos los campos ❌");
    }

    if (!tipoFinal || !estado || !localidadFinal) {
      return alert("Faltan datos ❌");
    }

    try {
      setLoading(true);

      await apiPost("/maquinas", {
        codigo: codigo.trim(),
        serial_maquina: serialMaquina.trim(),
        serial_billetero: serialBilletero.trim(),
        tipo_maquina: tipoFinal,
        estado,
        localidad: localidadFinal
      });

      // 🔥 limpiar form
      setCodigo("");
      setSerialMaquina("");
      setSerialBilletero("");
      setEstado("");
      setTipo("");
      setNuevoTipo("");
      setLocalidad("");
      setNuevaLocalidad("");
      setUsarNuevaLocalidad(false);
      setUsarNuevoTipo(false);

      onCreated(); // recargar tabla
      onClose();

    } catch {
      alert("Error creando máquina ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">

      <div className="bg-white w-full max-w-xl p-6 rounded-xl shadow-xl">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            ➕ Nueva Máquina
          </h2>

          <button onClick={onClose} className="text-gray-500 text-lg">
            ✖
          </button>
        </div>

        {/* FORM */}
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
          className="w-full border p-2 rounded mb-3"
        />

        {/* TIPO */}
        <label className="text-sm">Tipo</label>
        <select
          value={tipo}
          onChange={(e) => {
            if (e.target.value === "nuevo") {
              setUsarNuevoTipo(true);
              setTipo("");
            } else {
              setUsarNuevoTipo(false);
              setTipo(e.target.value);
            }
          }}
          className="w-full border p-2 rounded mb-2"
        >
          <option value="">Seleccionar tipo</option>

          {tipos.map((t, i) => (
            <option key={i} value={t}>{t}</option>
          ))}

          <option value="nuevo">➕ Nuevo tipo</option>
        </select>

        {usarNuevoTipo && (
          <input
            placeholder="Nuevo tipo..."
            value={nuevoTipo}
            onChange={(e) => setNuevoTipo(e.target.value)}
            className="w-full border p-2 rounded mb-2"
          />
        )}

        {/* ESTADO */}
        <label className="text-sm">Estado</label>
        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          className="w-full border p-2 rounded mb-3"
        >
          <option value="">Seleccionar estado</option>
          <option value="funcional">Funcional</option>
          <option value="no funcional">No funcional</option>
        </select>

        {/* LOCALIDAD */}
        <label className="text-sm">Ubicación</label>
        <select
          value={usarNuevaLocalidad ? "nueva" : localidad}
          onChange={(e) => {
            if (e.target.value === "nueva") {
              setUsarNuevaLocalidad(true);
              setLocalidad("");
            } else {
              setUsarNuevaLocalidad(false);
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

        {usarNuevaLocalidad && (
          <input
            placeholder="Nueva ubicación..."
            value={nuevaLocalidad}
            onChange={(e) => setNuevaLocalidad(e.target.value)}
            className="w-full border p-2 rounded mb-2"
          />
        )}

        {/* BOTÓN */}
        <button
          onClick={guardar}
          disabled={loading}
          className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white py-2 rounded disabled:bg-gray-400"
        >
          {loading ? "Creando..." : "Crear máquina"}
        </button>

      </div>
    </div>
  );
}