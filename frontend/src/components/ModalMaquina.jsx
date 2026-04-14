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

  // 🔥 editar máquina
  const [estado, setEstado] = useState("");
  const [localidades, setLocalidades] = useState([]);
  const [localidad, setLocalidad] = useState("");
  const [nuevaLocalidad, setNuevaLocalidad] = useState("");
  const [usarNueva, setUsarNueva] = useState(false);

  // 🔹 cargar detalle
  const cargarDetalle = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API}/maquinas/${maquina.id}`);
      const data = await res.json();

      setDetalle(data);
      setEstado(data.estado);
      setLocalidad(data.localidad);

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

    // 🔹 usuarios
    const cargarUsuarios = async () => {
      const res = await fetch(`${API}/usuarios`);
      const data = await res.json();
      setUsuarios(data || []);
    };

    // 🔹 localidades existentes
    const cargarLocalidades = async () => {
      const res = await fetch(`${API}/maquinas`);
      const data = await res.json();
      const unicas = [...new Set(data.map(m => m.localidad))];
      setLocalidades(unicas);
    };

    cargarUsuarios();
    cargarLocalidades();

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

  // 🔥 guardar edición máquina
  const guardarEdicion = async () => {

    const finalLocalidad = usarNueva ? nuevaLocalidad : localidad;

    if (!estado) return alert("Selecciona estado ❌");
    if (!finalLocalidad) return alert("Selecciona ubicación ❌");

    try {
      await fetch(`${API}/maquinas/${maquina.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estado,
          localidad: finalLocalidad
        })
      });

      alert("Actualizado ✅");
      cargarDetalle();

    } catch {
      alert("Error actualizando ❌");
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

      <div className="bg-white w-full max-w-2xl p-6 rounded-xl shadow-xl overflow-y-auto max-h-[90vh]">

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
          <p className="text-center">Cargando...</p>
        ) : (
          <>
            {/* 🔥 EDICIÓN */}
            <div className="border p-4 rounded mb-4 bg-gray-50">
              <h3 className="font-semibold mb-2">Editar máquina</h3>

              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className="w-full border p-2 rounded mb-2"
              >
                <option value="">Estado</option>
                <option value="funcional">Funcional</option>
                <option value="no funcional">No funcional</option>
              </select>

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
                  type="text"
                  placeholder="Nueva ubicación..."
                  value={nuevaLocalidad}
                  onChange={(e) => setNuevaLocalidad(e.target.value)}
                  className="w-full border p-2 rounded mb-2"
                />
              )}

              <button
                onClick={guardarEdicion}
                className="w-full bg-blue-500 text-white p-2 rounded"
              >
                Guardar cambios
              </button>
            </div>

            {/* HISTORIAL */}
            <div className="max-h-52 overflow-y-auto mb-4 border rounded p-2 bg-gray-50">
              <h3 className="font-semibold mb-2">Historial</h3>

              {detalle?.mantenimientos?.length === 0 && (
                <p>No hay mantenimientos</p>
              )}

              {detalle?.mantenimientos?.map(m => (
                <div key={m.id} className="border p-2 rounded mb-2 bg-white">

                  <p className="text-xs text-gray-400">
                    📅 {new Date(m.fecha).toLocaleDateString()}
                  </p>

                  <p className="font-medium">{m.descripcion}</p>

                  <p className="text-xs">
                    👤 {m.usuarios?.join(", ") || "Sin técnicos"}
                  </p>

                  <button
                    onClick={() => eliminar(m.id)}
                    className="text-red-500 text-xs mt-1"
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
              className="w-full border p-2 rounded mb-2"
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
              className="w-full mt-3 bg-green-500 text-white p-2 rounded"
            >
              Guardar mantenimiento
            </button>
          </>
        )}
      </div>

      {/* CONFIRMAR ELIMINAR */}
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