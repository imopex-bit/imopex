import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Upload, FileText, Check, AlertCircle, ChevronLeft, ArrowRight } from "lucide-react";
import * as XLSX from "xlsx";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api";

export default function ImportarExcel() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const jsonData = XLSX.utils.sheet_to_json(ws);
      setData(jsonData);
      setError("");
    };
    reader.readAsBinaryString(file);
  };

  const procesarImportacion = async () => {
    if (data.length === 0) return;
    setLoading(true);
    try {
      // En el demo llamamos al endpoint real
      await api.post("/maquinas/import", data);
      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err) {
      setError("Error al importar los datos. Verifique el formato.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        <div className="flex items-center gap-4 mb-8">
          <Link to="/dashboard" className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 hover:text-blue-600 transition">
            <ChevronLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Importar Máquinas</h1>
            <p className="text-slate-500">Carga masiva de inventario desde Excel (.xlsx)</p>
          </div>
        </div>

        {!success ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upload Area */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="font-bold mb-4">Paso 1: Seleccionar Archivo</h3>
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 hover:border-blue-400 transition group">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <div className="p-3 bg-blue-50 rounded-xl text-blue-600 mb-3 group-hover:scale-110 transition">
                      <Upload size={24} />
                    </div>
                    <p className="text-sm text-slate-600 font-medium">Click o arrastra archivo</p>
                    <p className="text-xs text-slate-400 mt-1">XLSX, XLS (Máx. 10MB)</p>
                  </div>
                  <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileUpload} />
                </label>
              </div>

              <div className="bg-blue-600 p-6 rounded-2xl shadow-lg shadow-blue-200 text-white">
                <h4 className="font-bold flex items-center gap-2 mb-2">
                  <AlertCircle size={18} />
                  Formato Requerido
                </h4>
                <p className="text-blue-100 text-xs leading-relaxed">
                  El Excel debe contener las siguientes columnas: <br/>
                  <span className="font-mono bg-blue-700/50 px-1 rounded">codigo</span>, 
                  <span className="font-mono bg-blue-700/50 px-1 rounded ml-1">tipo_maquina</span>, 
                  <span className="font-mono bg-blue-700/50 px-1 rounded ml-1">estado</span>, 
                  <span className="font-mono bg-blue-700/50 px-1 rounded ml-1">localidad</span>.
                </p>
              </div>
            </div>

            {/* Preview Area */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 min-h-[400px] flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold">Paso 2: Vista Previa ({data.length} registros)</h3>
                  {data.length > 0 && (
                    <button 
                      onClick={procesarImportacion}
                      disabled={loading}
                      className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50 font-bold"
                    >
                      {loading ? "Procesando..." : "Confirmar Carga"}
                      <ArrowRight size={18} />
                    </button>
                  )}
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-rose-50 text-rose-600 rounded-xl flex items-center gap-3 text-sm">
                    <AlertCircle size={20} />
                    {error}
                  </div>
                )}

                {data.length > 0 ? (
                  <div className="overflow-x-auto border border-slate-100 rounded-xl">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider">
                        <tr>
                          {Object.keys(data[0]).map(key => (
                            <th key={key} className="px-4 py-3 font-bold">{key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {data.slice(0, 10).map((row, i) => (
                          <tr key={i} className="hover:bg-slate-50/50 transition">
                            {Object.values(row).map((val, j) => (
                              <td key={j} className="px-4 py-3 text-slate-600">{val}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {data.length > 10 && (
                      <p className="p-4 text-center text-slate-400 text-xs italic">
                        Mostrando solo los primeros 10 registros...
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                    <FileText size={48} strokeWidth={1} className="mb-4" />
                    <p>No hay datos para mostrar</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-12 rounded-3xl shadow-xl border border-slate-100 text-center max-w-lg mx-auto"
          >
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">¡Importación Exitosa!</h2>
            <p className="text-slate-500 mb-8">Los datos han sido cargados correctamente al sistema.</p>
            <Link to="/dashboard" className="inline-block px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200">
              Volver al Dashboard
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
