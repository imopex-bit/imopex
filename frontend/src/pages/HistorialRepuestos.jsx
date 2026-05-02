import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  History, ChevronLeft, ArrowUpCircle, ArrowDownCircle, 
  Cpu, User, Calendar, Search, Filter, Package
} from "lucide-react";
import api from "../api";

export default function HistorialRepuestos() {
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState("");

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await api.get("/repuestos/movimientos");
        setMovimientos(res || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  const filtered = filtroTipo 
    ? movimientos.filter(m => m.tipo_movimiento === filtroTipo)
    : movimientos;

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans relative overflow-hidden p-4 sm:p-8">
      
      {/* Background ambient gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="relative z-10 max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/repuestos" className="p-2 bg-slate-800/50 backdrop-blur-md rounded-xl shadow-sm border border-slate-700/50 hover:text-blue-400 text-slate-400 transition">
            <ChevronLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
              <History className="text-indigo-400" /> Historial de Movimientos
            </h1>
            <p className="text-slate-400">Entradas, salidas y asignaciones a máquinas</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button 
            onClick={() => setFiltroTipo("")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${!filtroTipo ? "bg-indigo-600 text-white border-indigo-500" : "bg-slate-800/50 text-slate-400 border-slate-700/50 hover:bg-slate-700"}`}
          >
            Todos
          </button>
          <button 
            onClick={() => setFiltroTipo("entrada")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${filtroTipo === "entrada" ? "bg-emerald-600 text-white border-emerald-500" : "bg-slate-800/50 text-slate-400 border-slate-700/50 hover:bg-slate-700"}`}
          >
            Entradas
          </button>
          <button 
            onClick={() => setFiltroTipo("salida_maquina")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${filtroTipo === "salida_maquina" ? "bg-rose-600 text-white border-rose-500" : "bg-slate-800/50 text-slate-400 border-slate-700/50 hover:bg-slate-700"}`}
          >
            Salidas a Máquina
          </button>
        </div>

        {/* Timeline Table */}
        <div className="bg-slate-800/40 backdrop-blur-md rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-700/50 bg-slate-900/40">
                  <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Fecha / Tipo</th>
                  <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Repuesto</th>
                  <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Cant.</th>
                  <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Destino / Observación</th>
                  <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Responsable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {filtered.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/60 transition-colors group">
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        {m.tipo_movimiento === "entrada" ? (
                          <ArrowUpCircle className="text-emerald-400" size={20} />
                        ) : (
                          <ArrowDownCircle className="text-rose-400" size={20} />
                        )}
                        <div>
                          <p className="text-xs font-bold text-slate-200">
                            {new Date(m.fecha).toLocaleDateString()}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            {new Date(m.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white">{m.repuestos?.nombre}</span>
                        <span className="text-[10px] font-mono text-slate-500">{m.repuestos?.codigo}</span>
                      </div>
                    </td>
                    <td className="p-5 text-center">
                      <span className={`text-lg font-black ${m.tipo_movimiento === "entrada" ? "text-emerald-400" : "text-rose-400"}`}>
                        {m.tipo_movimiento === "entrada" ? "+" : "-"}{m.cantidad}
                      </span>
                    </td>
                    <td className="p-5">
                      {m.maquinas ? (
                        <div className="flex items-center gap-2 bg-slate-900/40 p-2 rounded-lg border border-slate-700/30 w-fit">
                          <Cpu size={14} className="text-indigo-400" />
                          <span className="text-xs font-bold text-indigo-300">{m.maquinas.codigo}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 italic">{m.observacion || "Stock Entry"}</span>
                      )}
                      {m.maquinas && m.observacion && (
                        <p className="text-[10px] text-slate-500 mt-1 italic">{m.observacion}</p>
                      )}
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300">
                          {m.usuarios?.nombre?.charAt(0)}
                        </div>
                        <span className="text-xs font-medium text-slate-400">{m.usuarios?.nombre}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filtered.length === 0 && !loading && (
            <div className="text-center py-20">
              <Package className="mx-auto text-slate-800 mb-4" size={48} strokeWidth={1} />
              <p className="text-slate-600 font-bold">No hay movimientos registrados</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
