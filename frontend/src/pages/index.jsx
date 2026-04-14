import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ModalMaquina from "../components/ModalMaquina";

const API = "https://imopex.onrender.com/api";

export default function Index() {

  const [maquinas, setMaquinas] = useState([]);
  const [todas, setTodas] = useState([]);

  const [busqueda, setBusqueda] = useState("");

  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroLocalidad, setFiltroLocalidad] = useState("");

  const [seleccionada, setSeleccionada] = useState(null);

  // 🔥 NUEVO: edición inline
  const [editandoId, setEditandoId] = useState(null);
  const [estadoEdit, setEstadoEdit] = useState("");
  const [localidadEdit, setLocalidadEdit] = useState("");

  const navigate = useNavigate();

  // 🔐 proteger ruta
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) navigate("/");
  }, []);

  // 🔹 cargar máquinas
  const cargar = async () => {
    try {
      const res = await fetch(`${API}/maquinas`);
      const data = await res.json();
      setTodas(data || []);
    } catch {
      alert("Error cargando máquinas ❌");
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  // 🔥 filtros
  useEffect(() => {
    let filtradas = [...todas];

    if (busqueda) {
      filtradas = filtradas.filter(m =>
        String(m.codigo || "").toLowerCase().includes(busqueda.toLowerCase())
      );
    }

    if (filtroTipo) filtradas = filtradas.filter(m => m.tipo_maquina === filtroTipo);
    if (filtroEstado) filtradas = filtradas.filter(m => m.estado === filtroEstado);
    if (filtroLocalidad) filtradas = filtradas.filter(m => m.localidad === filtroLocalidad);

    setMaquinas(filtradas);
  }, [todas, busqueda, filtroTipo, filtroEstado, filtroLocalidad]);

  // 🔐 logout
  const logout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const tipos = [...new Set(todas.map(m => m.tipo_maquina))];
  const estados = ["funcional", "no funcional"];
  const localidades = [...new Set(todas.map(m => m.localidad))];

  // 🔥 iniciar edición
  const iniciarEdicion = (m) => {
    setEditandoId(m.id);
    setEstadoEdit(m.estado);
    setLocalidadEdit(m.localidad);
  };

  // 🔥 guardar cambios
  const guardarEdicion = async (id) => {
    try {
      await fetch(`${API}/maquinas/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          estado: estadoEdit,
          localidad: localidadEdit
        })
      });

      setEditandoId(null);
      cargar();

    } catch {
      alert("Error guardando ❌");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-7xl mx-auto bg-white p-6 rounded-2xl shadow-xl">

        {/* HEADER */}
        <div className="flex justify-between mb-6">
          <h1 className="text-2xl font-bold">Máquinas</h1>

          <button
            onClick={logout}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Cerrar sesión
          </button>
        </div>

        <button
          onClick={() => navigate("/crear")}
          className="mb-4 bg-green-500 text-white px-4 py-2 rounded"
        >
          + Añadir máquina
        </button>

        <input
          placeholder="Buscar..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />

        <table className="w-full border">

          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="p-2">Código</th>
              <th className="p-2">Estado</th>
              <th className="p-2">Localidad</th>
              <th className="p-2">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {maquinas.map(m => (
              <tr key={m.id} className="border">

                <td className="p-2">{m.codigo}</td>

                {/* 🔥 ESTADO */}
                <td className="p-2">
                  {editandoId === m.id ? (
                    <select
                      value={estadoEdit}
                      onChange={(e) => setEstadoEdit(e.target.value)}
                      className="border p-1"
                    >
                      <option value="funcional">Funcional</option>
                      <option value="no funcional">No funcional</option>
                    </select>
                  ) : (
                    m.estado
                  )}
                </td>

                {/* 🔥 LOCALIDAD */}
                <td className="p-2">
                  {editandoId === m.id ? (
                    <input
                      value={localidadEdit}
                      onChange={(e) => setLocalidadEdit(e.target.value)}
                      className="border p-1"
                    />
                  ) : (
                    m.localidad
                  )}
                </td>

                {/* 🔥 ACCIONES */}
                <td className="p-2 flex gap-2">

                  {editandoId === m.id ? (
                    <>
                      <button
                        onClick={() => guardarEdicion(m.id)}
                        className="bg-green-500 text-white px-2 py-1 rounded"
                      >
                        Guardar
                      </button>

                      <button
                        onClick={() => setEditandoId(null)}
                        className="bg-gray-400 text-white px-2 py-1 rounded"
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => iniciarEdicion(m)}
                        className="bg-blue-500 text-white px-2 py-1 rounded"
                      >
                        Editar
                      </button>

                      <button
                        onClick={() => setSeleccionada(m)}
                        className="bg-gray-700 text-white px-2 py-1 rounded"
                      >
                        Ver
                      </button>
                    </>
                  )}

                </td>

              </tr>
            ))}
          </tbody>

        </table>

        {/* MODAL */}
        {seleccionada && (
          <ModalMaquina
            maquina={seleccionada}
            onClose={() => setSeleccionada(null)}
          />
        )}

      </div>
    </div>
  );
}