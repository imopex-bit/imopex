import { useEffect, useState } from "react";

const API = "https://imopex.onrender.com";

export default function ModalMaquina({ maquina, onClose }) {

  const [detalle, setDetalle] = useState(null);
  const [usuarios, setUsuarios] = useState([]);

  const [descripcion, setDescripcion] = useState("");
  const [tecnicosSeleccionados, setTecnicosSeleccionados] = useState([]);

  // 🔹 cargar detalle máquina
  const cargarDetalle = async () => {
    const res = await fetch(`${API}/maquinas/${maquina.id}`);
    const data = await res.json();
    setDetalle(data);
  };

  useEffect(() => {
    cargarDetalle();
  }, [maquina]);

  // 🔹 cargar usuarios
  useEffect(() => {
    const cargarUsuarios = async () => {
      const res = await fetch(`${API}/usuarios`);
      const data = await res.json();
      setUsuarios(data || []);
    };

    cargarUsuarios();
  }, []);

  // 🔥 manejar checkbox (MULTIPLE REAL)
  const toggleTecnico = (id) => {
    setTecnicosSeleccionados(prev => {
      if (prev.includes(id)) {
        return prev.filter(t => t !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // 🔥 guardar mantenimiento
  const guardar = async () => {
    if (!descripcion) {
      alert("Escribe descripción ❌");
      return;
    }

    if (tecnicosSeleccionados.length === 0) {
      alert("Selecciona técnicos ❌");
      return;
    }

    try {
      const res = await fetch(`${API}/mantenimiento`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          descripcion,
          maquinas_id: maquina.id,
          usuarios_id: tecnicosSeleccionados
        })
      });

      if (!res.ok) throw new Error();

      alert("Guardado ✅");

      setDescripcion("");
      setTecnicosSeleccionados([]);

      cargarDetalle();

    } catch {
      alert("Error ❌");
    }
  };

  // 🔥 eliminar mantenimiento
  const eliminar = async (id) => {
    if (!window.confirm("¿Eliminar mantenimiento?")) return;

    await fetch(`${API}/mantenimiento/${id}`, {
      method: "DELETE"
    });

    cargarDetalle();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">

      <div className="bg-white w-full max-w-xl p-6 rounded-xl shadow-xl">

        {/* HEADER */}
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-bold">
            Máquina {maquina.codigo}
          </h2>

          <button onClick={onClose} className="text-red-500">
            ✖
          </button>
        </div>

        {/* DESCRIPCIÓN */}
        <p className="text-gray-600 mb-4">
          {detalle?.descripcion}
        </p>

        {/* HISTORIAL */}
        <div className="max-h-40 overflow-y-auto mb-4">
          <h3 className="font-semibold mb-2">Historial</h3>

          {detalle?.mantenimientos?.map(m => (
            <div key={m.id} className="border p-2 rounded mb-2 text-sm">

              <p className="text-gray-400 text-xs">
                📅 {new Date(m.fecha).toLocaleDateString()}
              </p>

              <p>🛠 {m.descripcion}</p>

              <div className="flex gap-2 flex-wrap mt-1">
                {m.usuarios?.map((u, i) => (
                  <span key={i} className="bg-gray-200 px-2 py-1 rounded text-xs">
                    👤 {u}
                  </span>
                ))}
              </div>

              <button
                onClick={() => eliminar(m.id)}
                className="text-red-500 text-xs mt-1"
              >
                Eliminar
              </button>

            </div>
          ))}
        </div>

        {/* INPUT DESCRIPCIÓN */}
        <textarea
          placeholder="Descripción mantenimiento..."
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className="w-full border p-2 rounded mb-3"
        />

        {/* 🔥 LISTA DE TÉCNICOS (CHECKBOX) */}
        <div className="border rounded p-3 max-h-40 overflow-y-auto">

          <h3 className="font-semibold mb-2">Seleccionar técnicos</h3>

          {usuarios.map(u => (
            <label
              key={u.id}
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded"
            >
              <input
                type="checkbox"
                checked={tecnicosSeleccionados.includes(u.id)}
                onChange={() => toggleTecnico(u.id)}
              />
              {u.nombre}
            </label>
          ))}

        </div>

        {/* CONTADOR */}
        <p className="text-xs text-gray-500 mt-2">
          Seleccionados: {tecnicosSeleccionados.length}
        </p>

        {/* BOTÓN */}
        <button
          onClick={guardar}
          className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white py-2 rounded"
        >
          Guardar mantenimiento
        </button>

      </div>
    </div>
  );
}