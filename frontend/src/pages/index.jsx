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

    if (filtroTipo) filtradas = filtradas.filter(m => m.tipo_maquina === filtroTipo);
    if (filtroEstado) filtradas = filtradas.filter(m => m.estado === filtroEstado);
    if (filtroLocalidad) filtradas = filtradas.filter(m => m.localidad === filtroLocalidad);

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

  const tipos = [...new Set(todas.map(m => m.tipo_maquina))];
  const estados = [...new Set(todas.map(m => m.estado))];
  const localidades = [...new Set(todas.map(m => m.localidad))];

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-6xl mx-auto bg-white p-6 rounded shadow">

        {/* HEADER */}
        <div className="flex justify-between mb-4">
          <h1 className="text-2xl font-bold">Gestor de Máquinas</h1>

          <button
            onClick={logout}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Cerrar sesión
          </button>
        </div>

        {/* CREAR */}
        <button
          onClick={() => navigate("/crear")}
          className="mb-4 bg-green-500 text-white px-4 py-2 rounded"
        >
          + Crear máquina
        </button>

        {/* BUSCADOR */}
        <input
          placeholder="Buscar código..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full p-2 border mb-4"
        />

        {/* FILTROS */}
        <div className="grid grid-cols-3 gap-2 mb-4">

          <select onChange={(e) => setFiltroTipo(e.target.value)}>
            <option value="">Tipo</option>
            {tipos.map((t, i) => <option key={i}>{t}</option>)}
          </select>

          <select onChange={(e) => setFiltroEstado(e.target.value)}>
            <option value="">Estado</option>
            {estados.map((e, i) => <option key={i}>{e}</option>)}
          </select>

          <select onChange={(e) => setFiltroLocalidad(e.target.value)}>
            <option value="">Localidad</option>
            {localidades.map((l, i) => <option key={i}>{l}</option>)}
          </select>

        </div>

        {/* TABLA */}
        <table border="1" width="100%">

          <thead>
            <tr>
              <th>#</th>
              <th>Código</th>
              <th>Serial Máquina</th> {/* NUEVO */}
              <th>Serial Billetero</th> {/* NUEVO */}
              <th>Tipo</th>
              <th>Estado</th>
              <th>Localidad</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {maquinas.map((m, i) => (
              <tr key={m.id}>
                <td>{i + 1}</td>
                <td>{m.codigo}</td>
                <td>{m.serial_maquina || "-"}</td>
                <td>{m.serial_billetero || "-"}</td>
                <td>{m.tipo_maquina}</td>
                <td>{m.estado}</td>
                <td>{m.localidad}</td>

                <td>
                  <button onClick={() => navigate(`/editar/${m.id}`)}>
                    Editar
                  </button>

                  <button onClick={() => eliminar(m.id)}>
                    Eliminar
                  </button>

                  <button onClick={() => navigate(`/maquina/${m.id}`)}>
                    Ver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>

        </table>

      </div>
    </div>
  );
}