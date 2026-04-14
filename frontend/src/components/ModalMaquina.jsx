import { useEffect, useState } from "react";

const API = "https://imopex.onrender.com/api";

export default function ModalMaquina({ maquina, onClose }) {

  const [detalle, setDetalle] = useState(null);
  const [usuarios, setUsuarios] = useState([]);

  const [descripcion, setDescripcion] = useState("");
  const [tecnicosSeleccionados, setTecnicosSeleccionados] = useState([]);

  const [busqueda, setBusqueda] = useState("");
  const [filtrados, setFiltrados] = useState([]);

  const [loading, setLoading] = useState(true);

  // 🔥 eliminar máquina
  const [confirmDelete, setConfirmDelete] = useState(false);

  // 🔹 cargar detalle
  const cargarDetalle = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API}/maquinas/${maquina.id}`);
      const data = await res.json();

      setDetalle(data);

    } catch {
      alert("Error cargando detalle ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (maquina?.id) {
      cargarDetalle();
    }

    const cargarUsuarios = async () => {
      const res = await fetch(`${API}/usuarios`);
      const data = await res.json();
      setUsuarios(data || []);
    };

    cargarUsuarios();

  }, [maquina]);

  // 🔎 filtro técnicos
  useEffect(() => {
    if (!busqueda) return setFiltrados([]);

    const f = usuarios.filter(u =>
      u.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );

    setFiltrados(f);
  }, [busqueda, usuarios]);

  // 🛠️ guardar mantenimiento
  const guardar = async () => {
    if (!descripcion.trim()) return alert("Escribe descripción ❌");
    if (tecnicosSeleccionados.length === 0) return alert("Selecciona técnicos ❌");

    try {
      await fetch(`${API}/mantenimiento`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          descripcion,
          maquinas_id: maquina.id,
          usuarios_id: tecnicosSeleccionados
        })
      });

      setDescripcion("");
      setTecnicosSeleccionados([]);
      setBusqueda("");

      cargarDetalle();

    } catch {
      alert("Error guardando ❌");
    }
  };

  // 🗑️ eliminar mantenimiento
  const eliminar = async (id) => {
    if (!window.confirm("¿Eliminar mantenimiento?")) return;

    await fetch(`${API}/mantenimiento/${id}`, {
      method: "DELETE"
    });

    cargarDetalle();
  };

  // 🗑️ eliminar máquina
  const eliminarMaquina = async () => {
    try {
      const res = await fetch(`${API}/maquinas/${maquina.id}`, {
        method: "DELETE"
      });

      if (!res.ok) throw new Error();

      onClose();
      window.location.reload();

    } catch {
      alert("Error eliminando ❌");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">

      <div className="bg-white w-full max-w-xl p-6 rounded-xl shadow-xl">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            Máquina {maquina.codigo}
          </h2>

          <div className="flex gap-2">
            <button
              onClick={() => setConfirmDelete(true)}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              Eliminar
            </button>

            <button onClick={onClose} className="text-gray-500 text-lg">
              ✖
            </button>
          </div>
        </div>

        {/* INFO */}
        {loading ? (
          <p className="text-center text-gray-500">Cargando...</p>
        ) : (
          <>
            <p className="text-gray-600 mb-4">
              {detalle?.descripcion || "Sin descripción"}
            </p>

            {/* HISTORIAL */}
            <div className="max-h-52 overflow-y-auto mb-4 border rounded p-2 bg-gray-50">

              <h3 className="font-semibold mb-2">Historial</h3>

              {(!detalle?.mantenimientos || detalle.mantenimientos.length === 0) && (
                <p className="text-sm text-gray-500">
                  No hay mantenimientos
                </p>
              )}

              {detalle?.mantenimientos?.map(m => (
                <div key={m.id} className="border p-2 rounded mb-2 text-sm bg-white">

                  <p className="text-gray-400 text-xs">
                    📅 {new Date(m.fecha).toLocaleDateString()}
                  </p>

                  <p className="font-medium">🛠 {m.descripcion}</p>

                  <div className="flex gap-2 flex-wrap mt-1">
                    {m.usuarios?.length > 0 ? (
                      m.usuarios.map((u, i) => (
                        <span key={i} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                          👤 {u}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">
                        Sin técnicos
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => eliminar(m.id)}
                    className="text-red-500 text-xs mt-1 hover:underline"
                  >
                    Eliminar
                  </button>

                </div>
              ))}
            </div>

            {/* MANTENIMIENTO */}
            <textarea
              placeholder="Descripción mantenimiento..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full border p-2 rounded mb-3"
            />

            <input
              type="text"
              placeholder="Buscar técnico..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full border p-2 rounded mb-2"
            />

            {filtrados.map(u => (
              <div
                key={u.id}
                onClick={() => {
                  if (!tecnicosSeleccionados.includes(u.id)) {
                    setTecnicosSeleccionados([...tecnicosSeleccionados, u.id]);
                  }
                  setBusqueda("");
                }}
                className="cursor-pointer hover:bg-gray-100 p-2 rounded"
              >
                {u.nombre}
              </div>
            ))}

            <button
              onClick={guardar}
              className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white py-2 rounded"
            >
              Guardar mantenimiento
            </button>
          </>
        )}
      </div>

      {/* MODAL CONFIRMAR ELIMINAR */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">

          <div className="bg-white p-6 rounded-xl shadow-xl w-80 text-center">

            <h2 className="text-lg font-bold mb-3">
              ¿Eliminar máquina?
            </h2>

            <p className="text-gray-600 mb-4">
              Esta acción no se puede deshacer
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDelete(false)}
                className="w-full bg-gray-300 p-2 rounded"
              >
                Cancelar
              </button>

              <button
                onClick={eliminarMaquina}
                className="w-full bg-red-500 text-white p-2 rounded"
              >
                Eliminar
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}