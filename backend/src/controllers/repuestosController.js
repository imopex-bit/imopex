import { supabase } from "../config/supabase.js";

// 🛠️ ASIGNAR VARIOS REPUESTOS (LÓGICA SIMPLE)
export const asignarMasivo = async (req, res) => {
  const { movimientos, maquina_id, tipo_movimiento } = req.body;
  
  try {
    for (const mov of movimientos) {
      const { repuesto_id, cantidad, observacion } = mov;

      // 1. Obtener stock actual
      const { data: repuesto } = await supabase
        .from("repuestos")
        .select("stock_actual")
        .eq("id", repuesto_id)
        .single();

      if (!repuesto) continue;
      
      // 2. Registrar el movimiento (OMITIMOS usuario_id para evitar errores de bigint/fkey)
      const { error: errMov } = await supabase.from("movimientos_repuestos").insert([{
        repuesto_id,
        maquina_id: tipo_movimiento === "salida" ? maquina_id : null,
        tipo_movimiento,
        cantidad: parseInt(cantidad) || 1,
        observacion: observacion || "",
        fecha: new Date().toISOString()
      }]);

      if (errMov) {
        console.error("❌ Error al insertar en historial:", errMov.message);
        // Si falla por el usuario, intentamos insertar SIN usuario_id (por si la columna es opcional)
      }

      // 3. Actualizar stock
      const nuevoStock = tipo_movimiento === "salida" 
        ? repuesto.stock_actual - (parseInt(cantidad) || 1)
        : repuesto.stock_actual + (parseInt(cantidad) || 1);

      await supabase.from("repuestos").update({ stock_actual: nuevoStock }).eq("id", repuesto_id);
    }

    res.json({ message: "Inventario actualizado y historial registrado ✅" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📦 LISTAR TODOS LOS REPUESTOS
export const getRepuestos = async (req, res) => {
  try {
    const { data, error } = await supabase.from("repuestos").select("*").order("nombre", { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📜 LISTAR MOVIMIENTOS
export const getMovimientos = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("movimientos_repuestos")
      .select(`
        *,
        repuestos (nombre, codigo),
        maquinas (codigo)
      `)
      .order("fecha", { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ➕ CREAR REPUESTO
export const crearRepuesto = async (req, res) => {
  try {
    const { data, error } = await supabase.from("repuestos").insert([req.body]).select();
    if (error) throw error;

    const nuevoRepuesto = data[0];

    // Si se creó con stock inicial, registramos el movimiento de entrada
    if (nuevoRepuesto.stock_actual > 0) {
      await supabase.from("movimientos_repuestos").insert([{
        repuesto_id: nuevoRepuesto.id,
        tipo_movimiento: "entrada",
        cantidad: nuevoRepuesto.stock_actual,
        observacion: "Stock inicial al crear repuesto",
        fecha: new Date().toISOString()
      }]);
    }

    res.json({ message: "Repuesto creado ✅", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✏️ EDITAR REPUESTO
export const editarRepuesto = async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase.from("repuestos").update(req.body).eq("id", id).select();
    if (error) throw error;
    res.json({ message: "Repuesto actualizado ✅", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🗑️ ELIMINAR REPUESTO
export const eliminarRepuesto = async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase.from("repuestos").delete().eq("id", id);
    if (error) throw error;
    res.json({ message: "Repuesto eliminado ✅" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📥 IMPORTAR VARIOS (SUMANDO STOCK SI EXISTE)
export const importRepuestos = async (req, res) => {
  try {
    const items = req.body;
    if (!Array.isArray(items)) return res.status(400).json({ error: "Formato inválido" });

    const permitidos = ["codigo", "nombre", "categoria", "stock_actual", "stock_minimo", "descripcion"];
    const resultados = [];

    for (const it of items) {
      // 1. Limpiar campos
      const limpio = {};
      permitidos.forEach(p => {
        if (it[p] !== undefined) limpio[p] = it[p];
      });

      // 2. Buscar si ya existe por código
      const { data: existente } = await supabase
        .from("repuestos")
        .select("id, stock_actual")
        .eq("codigo", limpio.codigo)
        .maybeSingle();

      let repuestoFinal;

      if (existente) {
        // 🛠️ SI EXISTE: SUMAR STOCK
        const nuevoStock = (existente.stock_actual || 0) + (parseInt(limpio.stock_actual) || 0);
        const { data: actualizado } = await supabase
          .from("repuestos")
          .update({ ...limpio, stock_actual: nuevoStock })
          .eq("id", existente.id)
          .select()
          .single();
        repuestoFinal = actualizado;
      } else {
        // ➕ SI NO EXISTE: CREAR NUEVO
        const { data: creado } = await supabase
          .from("repuestos")
          .insert([limpio])
          .select()
          .single();
        repuestoFinal = creado;
      }

      // 📜 REGISTRAR MOVIMIENTO (Solo si se añadió stock)
      if (repuestoFinal && (parseInt(limpio.stock_actual) || 0) > 0) {
        await supabase.from("movimientos_repuestos").insert([{
          repuesto_id: repuestoFinal.id,
          tipo_movimiento: "entrada",
          cantidad: parseInt(limpio.stock_actual),
          observacion: "Carga masiva (Suma de inventario)",
          fecha: new Date().toISOString()
        }]);
      }

      if (repuestoFinal) resultados.push(repuestoFinal);
    }

    res.json({ message: `${resultados.length} repuestos procesados (Stock sumado) ✅`, data: resultados });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
