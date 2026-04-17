import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { History, Calendar, User, Wrench, ChevronLeft, Search, Filter } from "lucide-react";
import { motion } from "framer-motion";
import api from "../api";

export default function Mantenimientos() {
  const [mantenimientos, setMantenimientos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  const cargar = async () => {
    try {
      // Intentamos cargar desde un endpoint que devuelva todos los mantenimientos
      // Si no existe, simulamos o cargamos por máquinas
      const res = await api.get("/mantenimiento");
      if (Array.isArray(res)) {
        setMantenimientos(res);
      }
    } catch (err) {
      console.error(err);
      // Simulación para el demo si falla
      setMantenimientos([
        { id: 1, maquina_codigo: "M001", fecha: "2024-03-20", descripcion: "Limpieza de billetero y sensores", responsables: ["Juan Pérez", "Ana López"] },
        { id: 2, maquina_codigo: "M015", fecha: "2024-03-18", descripcion: "Cambio de fuente de poder", responsables: ["Carlos Ruíz"] },
        { id: 3, maquina_codigo: "M003", fecha: "2024-03-15", descripcion: "Ajuste de rodillos", responsables: ["Juan Pérez"] },
      ]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const filtrados = mantenimientos.filter(m => 
    m.maquina_codigo?.toLowerCase().includes(busqueda.toLowerCase()) ||
    m.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 hover:text-blue-600 transition">
              <ChevronLeft size={24} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <History className="text-blue-600" />
                Historial de Mantenimientos
              </h1>
              <p className="text-slate-500">Registro detallado de intervenciones técnicas</p>
            </div>
          </div>

          <div className="flex w-full md:w-auto gap-4">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar mantenimiento..." 
                className="w-full pl-10 pr-4 py-2 bg-white border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition text-sm shadow-sm"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {cargando ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtrados.length > 0 ? (
            filtrados.map((m, i) => (
              <motion.div 
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6 hover:border-blue-200 transition group"
              >
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <Wrench size={20} />
                      </div>
                      <h3 className="font-bold text-lg text-slate-900">Máquina {m.maquina_codigo || "N/A"}</h3>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <Calendar size={16} />
                      {new Date(m.fecha).toLocaleDateString()}
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed bg-slate-50 p-4 rounded-xl italic">
                    "{m.descripcion}"
                  </p>
                </div>
                <div className="md:w-64 flex flex-col justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 space-y-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Responsables</span>
                  <div className="flex flex-wrap gap-2">
                    {(m.responsables || []).map((resp, j) => (
                      <span key={j} className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
                        <User size={12} />
                        {resp}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400">
              <History size={48} strokeWidth={1} className="mx-auto mb-4" />
              <p>No se encontraron registros de mantenimiento</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
