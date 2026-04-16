import { useEffect, useState } from "react";
import api from "../api";

export default function ModalMaquina({ maquina, onClose }) {

  const [detalle, setDetalle] = useState(null);
  const [usuarios, setUsuarios] = useState([]);

  const [descripcion, setDescripcion] = useState("");
  const [tecnicosSeleccionados, setTecnicosSeleccionados] = useState([]);

  const [busqueda, setBusqueda] = useState("");
  const [filtrados, setFiltrados] = useState([]);

  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // 🔹 cargar detalle máquina
  const cargarDetalle = async () => {
    if (!maquina?.id) return;

    try {
      setLoading(true);
      const data = await api.get(`/maquinas/${maquina.id}`);
      setDetalle(data);
    } catch {
      alert("Error cargando detalle ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDetalle();
  }, [maquina]);

  // 🔹 cargar usuarios
  useEffect(() => {
    const cargarUsuarios = async () => {
      try {
        const data = await api.get("/usuarios");
        setUsuarios(data || []);
      } catch {
        alert("Error cargando usuarios ❌");
      }
    };

    cargarUsuarios();
  }, []);

  // 🔎 filtro técnicos
  useEffect(() => {
    if (!busqueda) {
      setFiltrados([]);
      return;
    }

    const f = usuarios.filter(u =>
      u.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );

    setFiltrados(f);
  }, [busqueda, usuarios]);

  // 🔥 seleccionar técnico
  const seleccionarTecnico = (id) => {
    setTecnicosSeleccionados(prev => {
      if (prev.includes(id)) return prev;
      return [...prev, id];
    });

    setBusqueda("");
  };

  // 🔥 quitar técnico
  const quitarTecnico = (id) => {
    setTecnicosSeleccionados(prev =>
      prev.filter(t => t !== id)
    );
  };

  // 🛠️ guardar mantenimiento
  const guardar = async () => {
    if (!descripcion.trim()) {
      alert("Escribe descripción ❌");
      return;
    }

    if (tecnicosSeleccionados.length === 0) {
      alert("Selecciona técnicos ❌");
      return;
    }

    try {
      await api.post("/mantenimiento", {
        descripcion,
        maquinas_id: maquina.id,
        usuarios_id: tecnicosSeleccionados
      });

      setDescripcion("");
      setTecnicosSeleccionados([]);
      setBusqueda("");

      await cargarDetalle();

    } catch {
      alert("Error guardando ❌");
    }
  };

  // 🗑️ eliminar mantenimiento
  const eliminar = async (id) => {
    if (!window.confirm("¿Eliminar mantenimiento?")) return;

    try {
      await api.delete(`/mantenimiento/${id}`);
      await cargarDetalle();
    } catch {
      alert("Error eliminando ❌");
    }
  };

  // 🗑️ eliminar máquina
  const eliminarMaquina = async () => {
    try {
      await api.delete(`/maquinas/${maquina.id}`);

      onClose();
      window.location.href = "/dashboard";

    } catch {
      alert("Error eliminando ❌");
    }
  };

  if (!maquina) return null;

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

        {loading ? (
          <p className="text-center text-gray-500">Cargando...</p>
        ) : (
          <>
            {/* HISTORIAL */}
            <div className="max-h-52 overflow-y-auto mb-4 border rounded p-2 bg-gray-50">

              <h3 className="font-semibold mb-2">Historial</h3>

              {!detalle?.mantenimientos?.length && (
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
                    {m.usuarios?.map((u, i) => (
                      <span key={i} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                        👤 {u}
                      </span>
                    ))}
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

            {/* INPUT */}
            <textarea
              placeholder="Descripción mantenimiento..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full border p-2 rounded mb-3"
            />

            {/* BUSCAR */}
            <input
              type="text"
              placeholder="Buscar técnico..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full border p-2 rounded mb-2"
            />

            {/* RESULTADOS */}
            {filtrados.map(u => (
              <div
                key={u.id}
                onClick={() => seleccionarTecnico(u.id)}
                className="cursor-pointer hover:bg-gray-100 p-2 rounded"
              >
                {u.nombre}
              </div>
            ))}

            {/* SELECCIONADOS */}
            <div className="flex gap-2 flex-wrap mt-2">
              {tecnicosSeleccionados.map(id => {
                const user = usuarios.find(u => u.id === id);

                return (
                  <span
                    key={id}
                    onClick={() => quitarTecnico(id)}
                    className="bg-blue-500 text-white px-3 py-1 rounded-full cursor-pointer hover:bg-red-500"
                  >
                    {user?.nombre} ✖
                  </span>
                );
              })}
            </div>

            <button
              onClick={guardar}
              className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white py-2 rounded"
            >
              Guardar mantenimiento
            </button>
          </>
        )}
      </div>

      {/* CONFIRM DELETE */}
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