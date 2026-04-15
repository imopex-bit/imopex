import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ModalMaquina from "../components/ModalMaquina";
import ModalEditarMaquina from "../components/ModalEditarMaquina";
import ModalCrearMaquina from "../components/ModalCrearMaquina";
import api from "../api"; // ✅ CORREGIDO

export default function Index() {

  const [maquinas, setMaquinas] = useState([]);
  const [todas, setTodas] = useState([]);

  const [busqueda, setBusqueda] = useState("");

  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroLocalidad, setFiltroLocalidad] = useState("");

  const [seleccionada, setSeleccionada] = useState(null);
  const [editando, setEditando] = useState(null);
  const [creando, setCreando] = useState(false);

  const navigate = useNavigate();

  // 🔐 proteger ruta
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/");
  }, []);

  // 🔹 cargar máquinas
  const cargar = async () => {
    try {
      const res = await api.get("/maquinas");
      setTodas(res.data || []);
    } catch (err) {
      console.log(err);
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
    localStorage.clear();
    navigate("/");
  };

  // 🔥 datos dinámicos
  const tipos = [...new Set(todas.map(m => m.tipo_maquina))].filter(Boolean);
  const estados = ["funcional", "no funcional"];
  const localidades = [...new Set(todas.map(m => m.localidad))].filter(Boolean);

  // 🔥 DASHBOARD
  const total = todas.length;

  const contar = (campo) => {
    const conteo = {};
    todas.forEach((m) => {
      const key = m[campo] || "sin dato";
      conteo[key] = (conteo[key] || 0) + 1;
    });
    return conteo;
  };

  const porTipo = contar("tipo_maquina");
  const porEstado = contar("estado");
  const porLocalidad = contar("localidad");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6">

      <div className="max-w-7xl mx-auto bg-white p-6 rounded-2xl shadow-xl">

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

        {/* BOTÓN CREAR */}
        <button
          onClick={() => setCreando(true)}
          className="mb-6 bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg shadow"
        >
          + Añadir máquina
        </button>

        {/* 🔥 DASHBOARD */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">

          <div className="bg-blue-500 text-white p-4 rounded-xl shadow">
            <p className="text-sm">Total</p>
            <h2 className="text-3xl font-bold">{total}</h2>
          </div>

          <div className="bg-purple-500 text-white p-4 rounded-xl shadow">
            <p className="text-sm mb-2">Tipos</p>
            {Object.entries(porTipo).map(([k, v]) => (
              <p key={k}>{k}: {v}</p>
            ))}
          </div>

          <div className="bg-green-500 text-white p-4 rounded-xl shadow">
            <p className="text-sm mb-2">Estado</p>
            {Object.entries(porEstado).map(([k, v]) => (
              <p key={k}>{k}: {v}</p>
            ))}
          </div>

          <div className="bg-orange-500 text-white p-4 rounded-xl shadow">
            <p className="text-sm mb-2">Localidad</p>
            {Object.entries(porLocalidad).map(([k, v]) => (
              <p key={k}>{k}: {v}</p>
            ))}
          </div>

        </div>

        {/* BUSCADOR */}
        <input
          placeholder="Buscar por código..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full p-3 border rounded-lg mb-4 shadow-sm"
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

                  <td className="p-3 text-gray-500">{i + 1}</td>
                  <td className="p-3 font-semibold text-gray-800">{m.codigo}</td>
                  <td className="p-3">{m.serial_maquina || "-"}</td>
                  <td className="p-3">{m.serial_billetero || "-"}</td>

                  <td className="p-3">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                      {m.tipo_maquina}
                    </span>
                  </td>

                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold
                      ${m.estado === "funcional" ? "bg-green-100 text-green-700" : ""}
                      ${m.estado === "no funcional" ? "bg-red-100 text-red-700" : ""}
                    `}>
                      {m.estado}
                    </span>
                  </td>

                  <td className="p-3 text-gray-600">{m.localidad}</td>

                  <td className="p-3">
                    <div className="flex gap-2 justify-center">

                      <button
                        onClick={() => setEditando(m)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-xs"
                      >
                        Editar
                      </button>

                      <button
                        onClick={() => setSeleccionada(m)}
                        className="bg-gray-700 hover:bg-gray-800 text-white px-3 py-1 rounded-lg text-xs"
                      >
                        Ver
                      </button>

                    </div>
                  </td>

                </tr>
              ))}
            </tbody>

          </table>
        </div>

        {/* MODALES */}
        {seleccionada && (
          <ModalMaquina
            maquina={seleccionada}
            onClose={() => setSeleccionada(null)}
          />
        )}

        {editando && (
          <ModalEditarMaquina
            maquina={editando}
            onClose={() => setEditando(null)}
            onUpdated={cargar}
          />
        )}

        {creando && (
          <ModalCrearMaquina
            onClose={() => setCreando(false)}
            onCreated={cargar}
          />
        )}

      </div>
    </div>
  );
}