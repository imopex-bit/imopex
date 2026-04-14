import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API = "https://imopex.onrender.com";

export default function MaquinaDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [maquina, setMaquina] = useState(null);
  const [usuarios, setUsuarios] = useState([]);

  const [descripcion, setDescripcion] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [filtrados, setFiltrados] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);

  const [errorDescripcion, setErrorDescripcion] = useState(false);
  const [errorUsuarios, setErrorUsuarios] = useState(false);

  // 🔹 cargar máquina
  const cargarMaquina = async () => {
    const res = await fetch(`${API}/maquinas/${id}`);
    const data = await res.json();
    setMaquina(data);
  };

  // 🔹 cargar usuarios
  const cargarUsuarios = async () => {
    const res = await fetch(`${API}/usuarios`);
    const data = await res.json();
    setUsuarios(data);
  };

  useEffect(() => {
    cargarMaquina();
    cargarUsuarios();
  }, [id]);

  // 🔎 filtro búsqueda
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

  // 🛠️ crear mantenimiento
  const crearMantenimiento = async (e) => {
    e.preventDefault();

    let error = false;

    if (!descripcion) {
      setErrorDescripcion(true);
      error = true;
    }

    if (seleccionados.length === 0) {
      setErrorUsuarios(true);
      error = true;
    }

    if (error) return;

    try {
      const res = await fetch(`${API}/mantenimiento`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          descripcion,
          maquinas_id: id,
          usuarios_id: seleccionados.map(u => u.id)
        })
      });

      if (!res.ok) throw new Error();

      // limpiar
      setDescripcion("");
      setSeleccionados([]);
      setBusqueda("");
      setErrorDescripcion(false);
      setErrorUsuarios(false);

      cargarMaquina();

    } catch {
      alert("Error guardando ❌");
    }
  };

  if (!maquina) return <p className="text-center mt-10">Cargando...</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-xl">

        {/* VOLVER */}
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-4 text-blue-500"
        >
          ← Volver
        </button>

        {/* INFO */}
        <h1 className="text-2xl font-bold mb-2">
          Máquina {maquina.codigo}
        </h1>

        <p className="mb-6 text-gray-600">
          {maquina.descripcion || "Sin descripción"}
        </p>

        {/* 🔥 FORM MANTENIMIENTO */}
        <form
          onSubmit={crearMantenimiento}
          className="mb-6 p-4 border rounded-lg bg-gray-50"
        >
          <h2 className="font-semibold mb-3">
            ➕ Agregar mantenimiento
          </h2>

          {/* DESCRIPCIÓN */}
          <input
            type="text"
            placeholder="Descripción"
            value={descripcion}
            onChange={(e) => {
              setDescripcion(e.target.value);
              setErrorDescripcion(false);
            }}
            className={`w-full p-2 mb-2 border rounded ${
              errorDescripcion ? "border-red-500" : ""
            }`}
          />

          {/* BUSCADOR */}
          <input
            type="text"
            placeholder="Buscar técnico..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className={`w-full p-2 mb-2 border rounded ${
              errorUsuarios ? "border-red-500" : ""
            }`}
          />

          {/* RESULTADOS */}
          {filtrados.map(u => (
            <div
              key={u.id}
              onClick={() => {
                if (!seleccionados.find(s => s.id === u.id)) {
                  setSeleccionados([...seleccionados, u]);
                }
                setBusqueda("");
                setErrorUsuarios(false);
              }}
              className="cursor-pointer hover:bg-gray-200 p-1"
            >
              {u.nombre}
            </div>
          ))}

          {/* SELECCIONADOS */}
          <div className="flex gap-2 flex-wrap mt-2">
            {seleccionados.map(u => (
              <span
                key={u.id}
                onClick={() =>
                  setSeleccionados(
                    seleccionados.filter(x => x.id !== u.id)
                  )
                }
                className="bg-blue-500 text-white px-3 py-1 rounded-full cursor-pointer hover:bg-red-500"
              >
                {u.nombre} ✖
              </span>
            ))}
          </div>

          <button className="w-full mt-3 bg-green-500 text-white p-2 rounded hover:bg-green-600">
            Guardar mantenimiento
          </button>
        </form>

        {/* 🔥 HISTORIAL CON SCROLL */}
        <h2 className="text-xl font-semibold mb-3">
          🛠️ Historial
        </h2>

        <div className="max-h-64 overflow-y-auto border rounded p-3 bg-gray-50">

          {maquina.mantenimientos?.length === 0 && (
            <p>No hay mantenimientos</p>
          )}

          {maquina.mantenimientos?.map((m, i) => (
            <div key={i} className="mb-3 p-3 border rounded bg-white">
              <p className="text-xs text-gray-400">
                📅 {new Date(m.fecha).toLocaleDateString()}
              </p>

              <p className="font-semibold">{m.descripcion}</p>

              <p className="text-sm text-gray-500">
                👤 {m.usuarios?.join(", ")}
              </p>
            </div>
          ))}

        </div>

      </div>
    </div>
  );
}