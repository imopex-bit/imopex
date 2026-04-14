import { useEffect, useState } from "react";

const API = "https://imopex.onrender.com/api";

export default function ModalCrearMaquina({ onClose, onCreated }) {

  const [codigo, setCodigo] = useState("");
  const [serialMaquina, setSerialMaquina] = useState("");
  const [serialBilletero, setSerialBilletero] = useState("");

  const [tipo, setTipo] = useState("");
  const [estado, setEstado] = useState("");

  const [localidades, setLocalidades] = useState([]);
  const [localidad, setLocalidad] = useState("");
  const [nuevaLocalidad, setNuevaLocalidad] = useState("");
  const [usarNueva, setUsarNueva] = useState(false);

  const [loading, setLoading] = useState(true);

  // 🔹 cargar localidades
  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await fetch(`${API}/maquinas`);
        const data = await res.json();

        const unicas = [...new Set(data.map(m => m.localidad))];
        const tiposUnicos = [...new Set(data.map(m => m.tipo_maquina))];

        setLocalidades(unicas);

      } catch {
        alert("Error cargando datos ❌");
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, []);

  // 🔥 crear máquina
  const crear = async () => {

    const finalLocalidad = usarNueva ? nuevaLocalidad : localidad;

    if (!codigo || !serialMaquina || !serialBilletero) {
      return alert("Completa los campos ❌");
    }

    if (!tipo) return alert("Selecciona tipo ❌");
    if (!estado) return alert("Selecciona estado ❌");
    if (!finalLocalidad) return alert("Selecciona ubicación ❌");

    try {
      const res = await fetch(`${API}/maquinas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          codigo,
          serial_maquina: serialMaquina,
          serial_billetero: serialBilletero,
          tipo_maquina: tipo,
          estado,
          localidad: finalLocalidad
        })
      });

      if (!res.ok) throw new Error();

      alert("Máquina creada ✅");

      onCreated();
      onClose();

    } catch {
      alert("Error creando ❌");
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

        {loading ? (
          <p className="text-center">Cargando...</p>
        ) : (
          <>
            {/* CAMPOS */}
            <input
              placeholder="Código"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              className="w-full border p-2 rounded mb-2"
            />

            <input
              placeholder="Serial Máquina"
              value={serialMaquina}
              onChange={(e) => setSerialMaquina(e.target.value)}
              className="w-full border p-2 rounded mb-2"
            />

            <input
              placeholder="Serial Billetero"
              value={serialBilletero}
              onChange={(e) => setSerialBilletero(e.target.value)}
              className="w-full border p-2 rounded mb-2"
            />

            <input
              placeholder="Tipo de máquina"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full border p-2 rounded mb-2"
            />

            {/* ESTADO */}
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="w-full border p-2 rounded mb-2"
            >
              <option value="">Estado</option>
              <option value="funcional">Funcional</option>
              <option value="no funcional">No funcional</option>
            </select>

            {/* LOCALIDAD */}
            <select
              value={localidad}
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
              <option value="">Ubicación</option>

              {localidades.map((l, i) => (
                <option key={i}>{l}</option>
              ))}

              <option value="nueva">➕ Nueva ubicación</option>
            </select>

            {usarNueva && (
              <input
                placeholder="Nueva ubicación..."
                value={nuevaLocalidad}
                onChange={(e) => setNuevaLocalidad(e.target.value)}
                className="w-full border p-2 rounded mb-2"
              />
            )}

            {/* BOTÓN */}
            <button
              onClick={crear}
              className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 mt-3"
            >
              Crear máquina
            </button>
          </>
        )}

      </div>
    </div>
  );
}