import { supabase } from "../config/supabase.js";

// 🛠️ ASIGNAR VARIOS REPUESTOS (LÓGICA SIMPLE)
export const asignarMasivo = async (req, res) => {
  const { movimientos, maquina_id, tipo_movimiento } = req.body;

  try {
    for (const mov of movimientos) {
      const { repuesto_id, cantidad, observacion, motivo } = mov;

      // Formatear observación según motivo
      let obsFinal = observacion || "";

      if (motivo === "defectuoso") {
        obsFinal = `[DEFECTUOSO] ${obsFinal}`.trim();
      }

      if (motivo === "devolucion") {
        obsFinal = `[DEVOLUCION] ${obsFinal}`.trim();
      }

      // 1. Obtener stock actual
      const { data: repuesto, error: errRep } = await supabase
        .from("repuestos")
        .select("stock_actual")
        .eq("id", repuesto_id)
        .single();

      if (errRep || !repuesto) {
        console.error("❌ Repuesto no encontrado:", errRep?.message);
        continue;
      }

      const cantidadFinal = parseInt(cantidad) || 1;

      // 2. Registrar movimiento
      const { error: errMov } = await supabase
        .from("movimientos_repuestos")
        .insert([
          {
            repuesto_id,
            maquina_id: tipo_movimiento === "salida" ? maquina_id : null,
            tipo_movimiento,
            cantidad: cantidadFinal,
            observacion: obsFinal,
            fecha: new Date().toISOString(),
          },
        ]);

      if (errMov) {
        console.error(
          "❌ Error al insertar movimiento:",
          errMov.message
        );
      }

      // 3. Actualizar stock
      const nuevoStock =
        tipo_movimiento === "salida"
          ? repuesto.stock_actual - cantidadFinal
          : repuesto.stock_actual + cantidadFinal;

      const { error: errUpdate } = await supabase
        .from("repuestos")
        .update({
          stock_actual: nuevoStock,
        })
        .eq("id", repuesto_id);

      if (errUpdate) {
        console.error(
          "❌ Error al actualizar stock:",
          errUpdate.message
        );
      }
    }

    return res.json({
      message: "Inventario actualizado y historial registrado ✅",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: err.message,
    });
  }
};

// 📦 LISTAR TODOS LOS REPUESTOS
export const getRepuestos = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("repuestos")
      .select("*")
      .order("nombre", { ascending: true });

    if (error) {
      throw error;
    }

    return res.json(data || []);
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
};

// 📜 LISTAR MOVIMIENTOS
export const getMovimientos = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("movimientos_repuestos")
      .select(`
        *,
        repuestos (
          nombre,
          codigo
        ),
        maquinas (
          codigo
        )
      `)
      .order("fecha", { ascending: false });

    if (error) {
      throw error;
    }

    return res.json(data || []);
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
};

// ➕ CREAR REPUESTO
export const crearRepuesto = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("repuestos")
      .insert([req.body])
      .select();

    if (error) {
      throw error;
    }

    const nuevoRepuesto = data?.[0];

    // Registrar movimiento inicial si tiene stock
    if (nuevoRepuesto && nuevoRepuesto.stock_actual > 0) {
      await supabase
        .from("movimientos_repuestos")
        .insert([
          {
            repuesto_id: nuevoRepuesto.id,
            tipo_movimiento: "entrada",
            cantidad: nuevoRepuesto.stock_actual,
            observacion: "Stock inicial al crear repuesto",
            fecha: new Date().toISOString(),
          },
        ]);
    }

    return res.json({
      message: "Repuesto creado ✅",
      data,
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
};

// ✏️ EDITAR REPUESTO
export const editarRepuesto = async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from("repuestos")
      .update(req.body)
      .eq("id", id)
      .select();

    if (error) {
      throw error;
    }

    return res.json({
      message: "Repuesto actualizado ✅",
      data,
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
};

// 🗑️ ELIMINAR REPUESTO
export const eliminarRepuesto = async (req, res) => {
  const { id } = req.params;

  try {
    const { error } = await supabase
      .from("repuestos")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    return res.json({
      message: "Repuesto eliminado ✅",
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
};

// 📥 IMPORTAR VARIOS (SUMANDO STOCK SI EXISTE)
export const importRepuestos = async (req, res) => {
  try {
    const items = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({
        error: "Formato inválido",
      });
    }

    const permitidos = [
      "codigo",
      "nombre",
      "categoria",
      "stock_actual",
      "stock_minimo",
      "descripcion",
    ];

    const resultados = [];

    for (const it of items) {
      const limpio = {};

      permitidos.forEach((campo) => {
        if (it[campo] !== undefined) {
          limpio[campo] = it[campo];
        }
      });

      // Buscar si ya existe
      const { data: existente } = await supabase
        .from("repuestos")
        .select("id, stock_actual")
        .eq("codigo", limpio.codigo)
        .maybeSingle();

      let repuestoFinal;

      if (existente) {
        const nuevoStock =
          (existente.stock_actual || 0) +
          (parseInt(limpio.stock_actual) || 0);

        const { data: actualizado } = await supabase
          .from("repuestos")
          .update({
            ...limpio,
            stock_actual: nuevoStock,
          })
          .eq("id", existente.id)
          .select()
          .single();

        repuestoFinal = actualizado;
      } else {
        const { data: creado } = await supabase
          .from("repuestos")
          .insert([limpio])
          .select()
          .single();

        repuestoFinal = creado;
      }

      // Registrar entrada si hubo stock
      if (
        repuestoFinal &&
        (parseInt(limpio.stock_actual) || 0) > 0
      ) {
        await supabase
          .from("movimientos_repuestos")
          .insert([
            {
              repuesto_id: repuestoFinal.id,
              tipo_movimiento: "entrada",
              cantidad: parseInt(limpio.stock_actual),
              observacion:
                "Carga masiva (Suma de inventario)",
              fecha: new Date().toISOString(),
            },
          ]);
      }

      if (repuestoFinal) {
        resultados.push(repuestoFinal);
      }
    }

    return res.json({
      message: `${resultados.length} repuestos procesados (Stock sumado) ✅`,
      data: resultados,
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
};

// 🔄 REVERTIR MOVIMIENTO (DESHACER ACCIÓN)
export const revertMovimiento = async (req, res) => {
  const { id } = req.params;

  console.log(
    "🔄 Intentando revertir movimiento ID:",
    id
  );

  try {
    // 1. Obtener movimiento
    const { data: mov, error: errMov } = await supabase
      .from("movimientos_repuestos")
      .select("*")
      .eq("id", id)
      .single();

    if (errMov || !mov) {
      console.error(
        "❌ Movimiento no encontrado:",
        errMov
      );

      return res.status(404).json({
        error: "Movimiento no encontrado",
      });
    }

    // 2. Obtener repuesto
    const { data: repuesto, error: errRep } = await supabase
      .from("repuestos")
      .select("stock_actual")
      .eq("id", mov.repuesto_id)
      .single();

    if (errRep || !repuesto) {
      console.error(
        "❌ Repuesto no encontrado:",
        errRep
      );

      return res.status(404).json({
        error: "Repuesto no encontrado",
      });
    }

    const cantidad = mov.cantidad;
    const stockActual = repuesto.stock_actual;

    let nuevoStock = stockActual;

    // 3. Revertir stock
    if (mov.tipo_movimiento === "entrada") {
      nuevoStock = stockActual - cantidad;
    }

    if (mov.tipo_movimiento === "salida") {
      nuevoStock = stockActual + cantidad;
    }

    if (nuevoStock < 0) {
      return res.status(400).json({
        error:
          "No se puede revertir: el stock quedaría negativo.",
      });
    }

    // 4. Actualizar stock
    const { error: errUpdate } = await supabase
      .from("repuestos")
      .update({
        stock_actual: nuevoStock,
      })
      .eq("id", mov.repuesto_id);

    if (errUpdate) {
      throw errUpdate;
    }

    // 5. Eliminar historial
    const { error: errDelete } = await supabase
      .from("movimientos_repuestos")
      .delete()
      .eq("id", id);

    if (errDelete) {
      throw errDelete;
    }

    console.log(
      "✅ Movimiento revertido. Nuevo stock:",
      nuevoStock
    );

    return res.json({
      message: "Acción revertida y stock ajustado ✅",
      nuevoStock,
    });
  } catch (err) {
    console.error(
      "🔥 Error crítico al revertir:",
      err.message
    );

    return res.status(500).json({
      error: err.message,
    });
  }
};