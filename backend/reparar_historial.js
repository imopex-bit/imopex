import { supabase } from "./src/config/supabase.js";

async function reparar() {
  console.log("🚀 Iniciando reparación de historial...");
  
  // 1. Obtener todos los repuestos
  const { data: repuestos } = await supabase.from("repuestos").select("*");
  
  if (!repuestos) return console.log("No hay repuestos.");

  for (const r of repuestos) {
    // 2. Verificar si ya tiene movimientos
    const { data: movs } = await supabase
      .from("movimientos_repuestos")
      .select("id")
      .eq("repuesto_id", r.id)
      .limit(1);

    if (movs && movs.length === 0 && r.stock_actual > 0) {
      console.log(`📦 Reparando historial para: ${r.nombre} (Stock: ${r.stock_actual})`);
      
      await supabase.from("movimientos_repuestos").insert([{
        repuesto_id: r.id,
        tipo_movimiento: "entrada",
        cantidad: r.stock_actual,
        observacion: "Stock inicial (Recuperado por sistema)",
        fecha: r.created_at || new Date().toISOString()
      }]);
    }
  }

  console.log("✅ Historial reparado con éxito.");
  process.exit();
}

reparar();
