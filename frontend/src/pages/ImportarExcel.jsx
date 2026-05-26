import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  Upload, FileText, Check, AlertCircle, ChevronLeft, 
  ArrowRight, Package, Settings, Download, Table
} from "lucide-react";
import * as XLSX from "xlsx";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api";

export default function ImportarExcel() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [importType, setImportType] = useState("maquinas"); // 'maquinas' o 'repuestos'
  const [showExample, setShowExample] = useState(false);
  const fileInputRef = useRef(null);

  const navigate = useNavigate();

  // 🧹 Limpiar todo cuando cambias de pestaña
  useEffect(() => {
    setData([]);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [importType]);

  const normalizarLlave = (key) => {
    const k = key.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Quitar tildes y minúsculas
    
    // Mapeo de Máquinas
    if (["codigo", "cod", "id", "identificador"].includes(k)) return "codigo";
    if (["tipo", "modelo", "clase", "tipo_maquina"].includes(k)) return "tipo_maquina";
    if (["estado", "est", "status"].includes(k)) return "estado";
    if (["localidad", "ubicacion", "sede", "sitio"].includes(k)) return "localidad";
    if (["descripcion", "notas", "detalles", "info"].includes(k)) return "descripcion";
    if (["serial", "serie", "sn", "s/n", "serial_maquina"].includes(k)) return "serial_maquina";
    if (["b1", "billetero1", "serial_b1", "billetero_1", "serial_billetero_1"].includes(k)) return "serial_billetero_1";
    if (["b2", "billetero2", "serial_b2", "billetero_2", "serial_billetero_2"].includes(k)) return "serial_billetero_2";
    
    // Mapeo de Repuestos
    if (["referencia", "ref"].includes(k)) return "codigo";
    if (["nombre", "repuesto", "item", "articulo"].includes(k)) return "nombre";
    if (["categoria", "familia", "grupo"].includes(k)) return "categoria";
    if (["stock", "cantidad", "cant", "disponible", "stock_actual"].includes(k)) return "stock_actual";
    if (["minimo", "stock_minimo", "alerta"].includes(k)) return "stock_minimo";
    if (["descripcion", "notas", "especificaciones"].includes(k)) return "descripcion";
    
    return null; // 🔥 CAMBIO: Retornar NULL si no se reconoce la columna
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const jsonData = XLSX.utils.sheet_to_json(ws);
        
        if (jsonData.length === 0) {
          setError("El archivo está vacío ❌");
          return;
        }

        // 🔥 NORMALIZAR COLUMNAS Y CONTAR RECONOCIDAS
        let recognizedColsCount = 0;
        const normalizado = jsonData
          .map(row => {
            const newRow = {};
            Object.keys(row).forEach(key => {
              const mappedKey = normalizarLlave(key);
              if (mappedKey) {
                newRow[mappedKey] = row[key];
                recognizedColsCount++;
              }
            });
            return newRow;
          })
          .filter(row => Object.keys(row).length > 0);

        if (recognizedColsCount === 0) {
          setError("❌ El archivo no contiene ninguna columna compatible con este sistema.");
          setData([]);
          return;
        }

        // 🔥 VALIDACIÓN ESTRICTA DE TIPO SEGÚN COLUMNAS CLAVE
        const isMaquinaFile = normalizado.some(r => r.serial_maquina !== undefined || r.localidad !== undefined);
        const isRepuestoFile = normalizado.some(r => r.stock_actual !== undefined);

        if (importType === "maquinas" && !isMaquinaFile) {
          setError("⚠️ El archivo NO parece ser de MÁQUINAS. Por favor, verifica que las columnas coincidan con el ejemplo (Serial o Localidad son obligatorios).");
          setData([]);
          return;
        }
        if (importType === "repuestos" && !isRepuestoFile) {
          setError("⚠️ El archivo NO parece ser de REPUESTOS. Por favor, verifica que tenga la columna de Stock y que los valores sean mayores a 0.");
          setData([]);
          return;
        }

        // 🔥 FILTRAR SOLO LOS QUE TIENEN STOCK (Si es Repuestos)
        const finalData = importType === "repuestos" 
          ? normalizado.filter(r => (parseInt(r.stock_actual) || 0) > 0)
          : normalizado;

        if (finalData.length === 0) {
          setError("❌ No se encontraron registros válidos para importar (¿Quizás todos tienen stock 0?)");
          setData([]);
          return;
        }

        setData(finalData);
        setError("");
      } catch (err) {
        setError("Error leyendo el archivo. Asegúrate que sea un Excel válido.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const procesarImportacion = async () => {
    if (data.length === 0) return;
    setLoading(true);
    setError("");
    
    const endpoint = importType === "maquinas" ? "/maquinas/import" : "/repuestos/import";
    
    try {
      await api.post(endpoint, data);
      setSuccess(true);
      setTimeout(() => navigate(importType === "maquinas" ? "/dashboard" : "/repuestos"), 2500);
    } catch (err) {
      setError(err.message || "Error desconocido al importar.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formats = {
    maquinas: [
      { col: "codigo", desc: "Código único de la máquina (Texto)" },
      { col: "tipo_maquina", desc: "Tipo (ej: Tragamonedas, Casino)" },
      { col: "estado", desc: "funcional / no funcional" },
      { col: "localidad", desc: "Ubicación de la máquina" },
      { col: "descripcion", desc: "Notas adicionales (Opcional)" },
      { col: "serial_maquina", desc: "Número de serie de la máquina" },
      { col: "serial_billetero_1", desc: "Serial del primer billetero" },
      { col: "serial_billetero_2", desc: "Serial del segundo billetero (Opcional)" }
    ],
    repuestos: [
      { col: "codigo", desc: "Código del repuesto (Texto)" },
      { col: "nombre", desc: "Nombre descriptivo" },
      { col: "categoria", desc: "Ej: Pantallas, Billeteros" },
      { col: "stock_actual", desc: "Cantidad disponible (Número)" },
      { col: "stock_minimo", desc: "Alerta de stock bajo (Número)" },
      { col: "descripcion", desc: "Notas técnicas (Opcional)" }
    ]
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans relative overflow-hidden">
      
      {/* Background ambient gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/10 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="relative z-10 h-full flex flex-col">
        <main className="max-w-6xl mx-auto p-4 sm:p-8 space-y-6 flex-1 w-full">
          
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div>

              <h1 className="text-3xl font-extrabold text-white">Importación Masiva</h1>
              <p className="text-slate-400">Carga datos desde archivos Excel rápidamente</p>
            </div>
          </div>

          <div className="flex bg-slate-800/40 p-1 rounded-2xl border border-slate-700/50">
            <button 
              onClick={() => { setImportType("maquinas"); setData([]); }}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${importType === "maquinas" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-200"}`}
            >
              <Settings size={18} /> Máquinas
            </button>
            <button 
              onClick={() => { setImportType("repuestos"); setData([]); }}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${importType === "repuestos" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-200"}`}
            >
              <Package size={18} /> Repuestos
            </button>
          </div>
        </div>

        {!success ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upload & Instructions */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-slate-800/40 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-slate-700/50">
                <h3 className="font-extrabold text-white mb-4 flex items-center gap-2">
                  <Upload size={20} className="text-blue-400" /> Paso 1: Carga
                </h3>
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-600 rounded-2xl cursor-pointer hover:bg-slate-800/60 hover:border-blue-500/50 transition-all group shadow-inner bg-slate-900/20">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20 mb-3 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all shadow-sm">
                      <FileText size={24} />
                    </div>
                    <p className="text-sm text-slate-300 font-bold">Seleccionar Excel</p>
                    <p className="text-[10px] text-slate-500 mt-1 font-medium">XLSX, XLS de {importType}</p>
                  </div>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    className="hidden" 
                    accept=".xlsx, .xls" 
                    onChange={handleFileUpload} 
                  />
                </label>
              </div>

              <div className="bg-slate-800/40 backdrop-blur-md p-6 rounded-3xl shadow-lg border border-slate-700/50 relative overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-extrabold flex items-center gap-2 text-indigo-400">
                    <Table size={18} /> Formato Requerido
                  </h4>
                  <button 
                    onClick={() => setShowExample(true)}
                    className="text-[10px] font-bold text-blue-400 hover:underline"
                  >
                    Ver Ejemplo
                  </button>
                </div>
                <div className="space-y-3">
                  {formats[importType].map((f, i) => (
                    <div key={i} className="flex flex-col gap-0.5">
                      <span className="text-xs font-mono text-emerald-400 font-bold">{f.col}</span>
                      <span className="text-[10px] text-slate-500">{f.desc}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 flex items-start gap-2">
                  <AlertCircle size={14} className="text-blue-400 mt-0.5" />
                  <p className="text-[10px] text-blue-300 leading-relaxed font-medium">
                    Los encabezados del Excel deben coincidir exactamente con los nombres en verde.
                  </p>
                </div>
              </div>
            </div>

            {/* Preview Area */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-800/40 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-slate-700/50 min-h-[500px] flex flex-col">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h3 className="font-extrabold text-white">
                    Paso 2: Vista Previa <span className="text-indigo-400 ml-2">({data.length} registros)</span>
                  </h3>
                  {data.length > 0 && (
                    <button 
                      onClick={procesarImportacion}
                      disabled={loading}
                      className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all disabled:opacity-50 disabled:pointer-events-none font-bold"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>Importar Todo <ArrowRight size={18} /></>
                      )}
                    </button>
                  )}
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl flex items-center gap-3 text-sm font-bold shadow-lg shadow-rose-500/5">
                    <AlertCircle size={20} />
                    {error}
                  </div>
                )}

                {data.length > 0 ? (
                  <div className="overflow-x-auto border border-slate-700/50 rounded-2xl shadow-inner bg-slate-900/30 flex-1">
                    <table className="w-full text-[11px] text-left border-collapse">
                      <thead className="bg-slate-900/60 text-slate-400 uppercase tracking-wider border-b border-slate-700/50">
                        <tr>
                          {Object.keys(data[0]).map(key => (
                            <th key={key} className="px-5 py-4 font-bold whitespace-nowrap">{key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/50">
                        {data.slice(0, 15).map((row, i) => (
                          <tr key={i} className="hover:bg-slate-700/30 transition-colors">
                            {Object.values(row).map((val, j) => (
                              <td key={j} className="px-5 py-3 text-slate-300 font-medium whitespace-nowrap">{String(val)}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {data.length > 15 && (
                      <p className="p-4 text-center text-slate-500 text-xs italic font-medium bg-slate-900/40 border-t border-slate-700/50">
                        Mostrando solo los primeros 15 registros de {data.length}...
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-500 bg-slate-900/20 rounded-2xl border border-dashed border-slate-700/50">
                    <div className="p-5 bg-slate-800/50 rounded-full mb-4 shadow-inner">
                      <Table size={48} strokeWidth={1} className="text-slate-600" />
                    </div>
                    <p className="font-bold text-slate-400">Sin datos cargados</p>
                    <p className="text-[10px] mt-1 uppercase tracking-widest font-bold text-slate-600">Espera de archivo XLSX / XLS</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-800/40 backdrop-blur-md p-12 rounded-3xl shadow-2xl border border-slate-700/50 text-center max-w-lg mx-auto relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 to-transparent pointer-events-none"></div>
            <div className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
              <Check size={48} strokeWidth={3} />
            </div>
            <h2 className="text-3xl font-extrabold text-white mb-3">¡Importación Exitosa!</h2>
            <p className="text-slate-400 mb-8 font-medium">Se han procesado {data.length} registros correctamente.</p>
            <Link to={importType === "maquinas" ? "/dashboard" : "/repuestos"} className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all hover:-translate-y-0.5">
              Ir a la Sección
            </Link>
          </motion.div>
        )}
        </main>
      </div>

      {/* Modal Ejemplo */}
      <AnimatePresence>
        {showExample && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
              onClick={() => setShowExample(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-slate-800 border border-slate-700 rounded-3xl w-full max-w-3xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-4 sm:p-6 border-b border-slate-700 flex justify-between items-center shrink-0">
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <Download size={20} className="text-indigo-400" />
                  Ejemplo Estructura: {importType === "maquinas" ? "Máquinas" : "Repuestos"}
                </h2>
                <button onClick={() => setShowExample(false)} className="text-slate-400 hover:text-white transition-colors">
                  <Check className="rotate-45" size={24} />
                </button>
              </div>
              <div className="p-4 sm:p-6 overflow-y-auto flex-1 min-h-0">
                <table className="w-full text-[10px] text-left border border-slate-700/50 rounded-lg overflow-hidden">
                  <thead className="bg-slate-900 text-slate-400 uppercase">
                    <tr>
                      {formats[importType].map(f => <th key={f.col} className="p-3 border-r border-slate-700/50">{f.col}</th>)}
                    </tr>
                  </thead>
                  <tbody className="bg-slate-800/50 divide-y divide-slate-700/50">
                    <tr>
                      {importType === "maquinas" ? (
                        <>
                          <td className="p-3">MAQ-001</td>
                          <td className="p-3">NV9</td>
                          <td className="p-3">funcional</td>
                          <td className="p-3">Bogotá - Norte</td>
                          <td className="p-3">Ubicada en pasillo principal</td>
                          <td className="p-3">SN-123456</td>
                          <td className="p-3">BILL-001</td>
                          <td className="p-3">BILL-002</td>
                        </>
                      ) : (
                        <>
                          <td className="p-3">REP-001</td>
                          <td className="p-3">Billetero NV9</td>
                          <td className="p-3">Billeteros</td>
                          <td className="p-3">10</td>
                          <td className="p-3">2</td>
                          <td className="p-3">Billetero estándar para tragamonedas</td>
                        </>
                      )}
                    </tr>
                    <tr>
                      {importType === "maquinas" ? (
                        <>
                          <td className="p-3">MAQ-002</td>
                          <td className="p-3">Tragamonedas</td>
                          <td className="p-3">no funcional</td>
                          <td className="p-3">Medellín</td>
                          <td className="p-3">Requiere cambio de pantalla</td>
                          <td className="p-3">SN-789012</td>
                          <td className="p-3">BILL-789</td>
                          <td className="p-3"></td>
                        </>
                      ) : (
                        <>
                          <td className="p-3">REP-002</td>
                          <td className="p-3">Pantalla 15"</td>
                          <td className="p-3">Monitores</td>
                          <td className="p-3">5</td>
                          <td className="p-3">1</td>
                          <td className="p-3">Pantalla de alta resolución</td>
                        </>
                      )}
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="p-4 sm:p-6 bg-slate-900/50 border-t border-slate-700 text-right shrink-0">
                <button 
                  onClick={() => setShowExample(false)}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold text-sm"
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

