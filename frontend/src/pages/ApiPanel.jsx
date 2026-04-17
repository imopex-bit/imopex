import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Terminal, Play, CheckCircle2, XCircle, Clock, ChevronLeft, Globe, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api";

const ENDPOINTS = [
  { method: "GET", path: "/maquinas", desc: "Listar todas las máquinas", auth: true },
  { method: "GET", path: "/maquinas/:id", desc: "Obtener detalle de una máquina", auth: true },
  { method: "POST", path: "/maquinas", desc: "Crear una nueva máquina", auth: true },
  { method: "PUT", path: "/maquinas/:id", desc: "Actualizar máquina", auth: true },
  { method: "DELETE", path: "/maquinas/:id", desc: "Eliminar máquina", auth: true },
  { method: "POST", path: "/maquinas/import", desc: "Importación masiva Excel", auth: true },
  { method: "POST", path: "/auth/login", desc: "Iniciar sesión", auth: false },
  { method: "GET", path: "/mantenimiento", desc: "Historial de mantenimientos", auth: true },
];

export default function ApiPanel() {
  const [logs, setLogs] = useState([]);
  const [testing, setTesting] = useState(null);

  const probarEndpoint = async (endpoint) => {
    setTesting(endpoint.path);
    const start = Date.now();
    let status = 200;
    let response = {};

    try {
      // For testing, we call the real API if it's a GET /maquinas
      // Others are simulated or called if possible
      if (endpoint.path === "/maquinas" && endpoint.method === "GET") {
        response = await api.get(endpoint.path);
      } else {
        // Simulated response for others to avoid side effects during demo
        await new Promise(r => setTimeout(r, 800));
        response = { message: "Simulación exitosa", path: endpoint.path };
      }
    } catch (err) {
      status = 500;
      response = { error: err.message };
    }

    const duration = Date.now() - start;
    const newLog = {
      id: Date.now(),
      method: endpoint.method,
      path: endpoint.path,
      status,
      duration,
      time: new Date().toLocaleTimeString(),
      response
    };

    setLogs(prev => [newLog, ...prev].slice(0, 20));
    setTesting(null);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-300 font-mono p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-8">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="p-2 bg-slate-800 rounded-xl hover:text-white transition">
              <ChevronLeft size={24} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Globe className="text-blue-400" />
                API Explorer
              </h1>
              <p className="text-slate-500 font-sans">Documentación interactiva y logs en tiempo real</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-bold border border-emerald-500/20">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            SERVIDOR ONLINE
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Endpoints List */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Lock size={14} />
              Endpoints Disponibles
            </h3>
            {ENDPOINTS.map((ep, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-2xl flex items-center justify-between hover:bg-slate-800 transition group"
              >
                <div className="flex items-center gap-4">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-md w-14 text-center ${
                    ep.method === "GET" ? "bg-emerald-500/10 text-emerald-400" :
                    ep.method === "POST" ? "bg-blue-500/10 text-blue-400" :
                    ep.method === "PUT" ? "bg-amber-500/10 text-amber-400" : "bg-rose-500/10 text-rose-400"
                  }`}>
                    {ep.method}
                  </span>
                  <div>
                    <div className="text-white text-sm font-bold">{ep.path}</div>
                    <div className="text-[11px] text-slate-500 font-sans">{ep.desc}</div>
                  </div>
                </div>
                <button 
                  onClick={() => probarEndpoint(ep)}
                  disabled={testing === ep.path}
                  className="p-2 bg-slate-700 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 transition"
                >
                  {testing === ep.path ? <Clock size={18} className="animate-spin" /> : <Play size={18} />}
                </button>
              </motion.div>
            ))}
          </div>

          {/* Live Logs */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Terminal size={14} />
              Request Log (Live)
            </h3>
            <div className="bg-[#020617] rounded-2xl border border-slate-800 h-[600px] overflow-y-auto p-4 space-y-4 font-mono text-[11px]">
              <AnimatePresence>
                {logs.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-slate-700 gap-4">
                    <Terminal size={48} strokeWidth={1} />
                    <p>Esperando peticiones...</p>
                  </div>
                )}
                {logs.map((log) => (
                  <motion.div 
                    key={log.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border-l-2 border-slate-800 pl-4 py-2 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {log.status === 200 ? <CheckCircle2 size={12} className="text-emerald-500" /> : <XCircle size={12} className="text-rose-500" />}
                        <span className="text-slate-500">{log.time}</span>
                        <span className="text-blue-400">{log.method}</span>
                        <span className="text-slate-300">{log.path}</span>
                      </div>
                      <span className="text-slate-600">{log.duration}ms</span>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded-lg text-slate-400 break-all">
                      <pre>{JSON.stringify(log.response, null, 2)}</pre>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
