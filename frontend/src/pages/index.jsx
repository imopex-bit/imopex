import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "https://imopex.onrender.com";

export default function Index() {

  const [maquinas, setMaquinas] = useState([]);
  const [todas, setTodas] = useState([]);

  const [busqueda, setBusqueda] = useState("");

  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroLocalidad, setFiltroLocalidad] = useState("");

  const [stats, setStats] = useState({
    total: 0,
    porTipo: {},
    porEstado: {},
    porLocalidad: {}
  });

  const navigate = useNavigate();

  // 🔐 proteger ruta
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) navigate("/");
  }, []);

  // 🔹 cargar máquinas
  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await fetch(`${API}/maquinas`);
        const data = await res.json();

        console.log("DATA API 👉", data); // 👈 DEBUG CLAVE

        setTodas(data || []);
      } catch {
        alert("Error cargando máquinas ❌");
      }
    };

    cargar();
  }, []);

  // 🔥 filtros + stats
  useEffect(() => {

    let filtradas = [...todas];

    if (busqueda) {
      filtradas = filtradas.filter(m =>
        String(m.codigo || "").toLowerCase().includes(busqueda.toLowerCase())
      );
    }

    if (filtroTipo) {
      filtradas = filtradas.filter(m => m.tipo_maquina === filtroTipo);
    }

    if (filtroEstado) {
      filtradas = filtradas.filter(m => m.estado === filtroEstado);
    }

    if (filtroLocalidad) {
      filtradas = filtradas.filter(m => m.localidad === filtroLocalidad);
    }

    setMaquinas(filtradas);

    const porTipo = {};
    const porEstado = {};
    const porLocalidad = {};

    filtradas.forEach(m => {
      porTipo[m.tipo_maquina] = (porTipo[m.tipo_maquina] || 0) + 1;
      porEstado[m.estado] = (porEstado[m.estado] || 0) + 1;
      porLocalidad[m.localidad] = (porLocalidad[m.localidad] || 0) + 1;
    });

    setStats({
      total: filtradas.length,
      porTipo,
      porEstado,
      porLocalidad
    });

  }, [todas, busqueda, filtroTipo, filtroEstado, filtroLocalidad]);

  // 🗑️ eliminar
  const eliminar = async (id) => {
    if (!window.confirm("¿Eliminar máquina?")) return;

    try {
      await fetch(`${API}/maquinas/${id}`, {
        method: "DELETE"
      });

      setTodas(prev => prev.filter(m => m.id !== id));

    } catch {
      alert("Error ❌");
    }
  };

  // 🔐 logout
  const logout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  // 🔹 filtros dinámicos
  const tipos = [...new Set(todas.map(m => m.tipo_maquina))];
  const estados = [...new Set(todas.map(m => m.estado))];
  const localidades = [...new Set(todas.map(m => m.localidad))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6">

      <div className="max-w-6xl mx-auto bg-white p-6 rounded-2xl shadow-xl">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h1 className="text-3xl font-bold text-gray-800">
            ⚙️ Gestor de Máquinas
          </h1>

          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            Cerrar sesión
          </button>
        </div>

        {/* CREAR */}
        <button
          onClick={() => navigate("/crear")}
          className="mb-6 bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg"
        >
          + Crear máquina
        </button>

        {/* DASHBOARD */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">

          <div className="bg-blue-500 text-white p-4 rounded-xl shadow">
            <p>Total</p>
            <h2 className="text-2xl font-bold">{stats.total}</h2>
          </div>

          <div className="bg-purple-500 text-white p-4 rounded-xl text-sm shadow">
            {Object.entries(stats.porTipo).map(([k, v]) => (
              <p key={k}>{k}: {v}</p>
            ))}
          </div>

          <div className="bg-green-500 text-white p-4 rounded-xl text-sm shadow">
            {Object.entries(stats.porEstado).map(([k, v]) => (
              <p key={k}>{k}: {v}</p>
            ))}
          </div>

          <div className="bg-orange-500 text-white p-4 rounded-xl text-sm shadow">
            {Object.entries(stats.porLocalidad).map(([k, v]) => (
              <p key={k}>{k}: {v}</p>
            ))}
          </div>

        </div>

        {/* BUSCADOR */}
        <input
          placeholder="Buscar código..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full p-3 border rounded-lg mb-4"
        />

        {/* FILTROS */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">

          <select onChange={(e) => setFiltroTipo(e.target.value)} className="p-2 border rounded-lg">
            <option value="">Tipo</option>
            {tipos.map((t, i) => <option key={i}>{t}</option>)}
          </select>

          <select onChange={(e) => setFiltroEstado(e.target.value)} className="p-2 border rounded-lg">
            <option value="">Estado</option>
            {estados.map((e, i) => <option key={i}>{e}</option>)}
          </select>

          <select onChange={(e) => setFiltroLocalidad(e.target.value)} className="p-2 border rounded-lg">
            <option value="">Localidad</option>
            {localidades.map((l, i) => <option key={i}>{l}</option>)}
          </select>

        </div>

        {/* TABLA */}
        <div className="overflow-x-auto rounded-xl shadow">

          <table className="w-full text-sm text-left">

            <thead className="bg-gray-900 text-white">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">Código</th>
                <th className="p-3">Serial Máquina</th>
                <th className="p-3">Serial Billetero</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Localidad</th>
                <th className="p-3 text-center">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {maquinas.map((m, i) => (
                <tr key={m.id} className="border-b hover:bg-gray-100 transition">

                  <td className="p-3">{i + 1}</td>
                  <td className="p-3">{m.codigo}</td>

                  <td className="p-3">
                    {m.serial_maquina ? m.serial_maquina : "-"}
                  </td>

                  <td className="p-3">
                    {m.serial_billetero ? m.serial_billetero : "-"}
                  </td>

                  <td className="p-3">{m.tipo_maquina}</td>
                  <td className="p-3">{m.estado}</td>
                  <td className="p-3">{m.localidad}</td>

                  <td className="p-3">
                    <div className="flex gap-2 justify-center">

                      <button
                        onClick={() => navigate(`/editar/${m.id}`)}
                        className="bg-blue-500 text-white px-3 py-1 rounded"
                      >
                        Editar
                      </button>

                      <button
                        onClick={() => eliminar(m.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded"
                      >
                        Eliminar
                      </button>

                    </div>
                  </td>

                </tr>
              ))}
            </tbody>

          </table>
        </div>

      </div>
    </div>
  );
}