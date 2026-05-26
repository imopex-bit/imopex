import { supabase } from "../config/supabase.js";

// 📦 LISTAR
export const getMaquinas = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("maquinas")
      .select("*");

    if (error) throw error;

    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔍 DETALLE
export const getMaquinaDetalle = async (req, res) => {
  const { id } = req.params;

  try {
    const { data: maquina, error: errMaq } = await supabase
      .from("maquinas")
      .select(`
        *,
        mantenimiento (
          *,
          mantenimiento_usuarios (
            usuarios (nombre)
          )
        )
      `)
      .eq("id", id)
      .maybeSingle();

    if (errMaq) throw errMaq;

    if (!maquina) {
      return res.status(404).json({ error: "No existe" });
    }

    // Formatear mantenimientos para aplanar los nombres de los usuarios responsables
    const mantenimientosFormateados = (maquina.mantenimiento || []).map(m => {
      const usuarios = m.mantenimiento_usuarios?.map(mu => mu.usuarios?.nombre).filter(Boolean) || [];
      const mLimpio = { ...m };
      delete mLimpio.mantenimiento_usuarios;
      return {
        ...mLimpio,
        usuarios
      };
    });

    // Ordenar mantenimientos por fecha de forma descendente
    mantenimientosFormateados.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    // Eliminar la propiedad 'mantenimiento' anidada original del objeto maquina
    const maquinaLimpia = { ...maquina };
    delete maquinaLimpia.mantenimiento;

    // 🛠️ REPUESTOS USADOS EN ESTA MÁQUINA (Historial de movimientos)
    const { data: repuestosUsados } = await supabase
      .from("movimientos_repuestos")
      .select(`
        *,
        repuestos (nombre, codigo)
      `)
      .eq("maquina_id", id)
      .eq("tipo_movimiento", "salida") // Solo las salidas cuentan como "usados"
      .order("fecha", { ascending: false });

    res.json({
      ...maquinaLimpia,
      mantenimientos: mantenimientosFormateados,
      repuestos: repuestosUsados || []
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ➕ CREAR
export const crearMaquina = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("maquinas")
      .insert([req.body])
      .select();

    if (error) throw error;

    res.json({ message: "Creado ✅", data });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✏️ EDITAR
export const editarMaquina = async (req, res) => {
  const { id } = req.params;
  const { estado, localidad, descripcion, serial_maquina, serial_billetero_1, serial_billetero_2, operador } = req.body;

  try {
    const { data, error } = await supabase
      .from("maquinas")
      .update({ 
        estado, 
        localidad, 
        descripcion, 
        serial_maquina, 
        serial_billetero_1, 
        serial_billetero_2,
        operador 
      })
      .eq("id", id)
      .select();

    if (error) throw error;

    res.json({ message: "Actualizado ✅", data });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🗑️ ELIMINAR
export const eliminarMaquina = async (req, res) => {
  const { id } = req.params;

  try {
    await supabase
      .from("mantenimiento")
      .delete()
      .eq("maquinas_id", id);

    const { data } = await supabase
      .from("maquinas")
      .delete()
      .eq("id", id)
      .select();

    if (!data || data.length === 0) {
      return res.status(400).json({ error: "No se eliminó" });
    }

    res.json({ message: "Máquina eliminada ✅" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📥 IMPORTAR
export const importMaquinas = async (req, res) => {
  try {
    const maquinas = req.body;
    if (!Array.isArray(maquinas)) return res.status(400).json({ error: "Formato inválido" });

    // Filtrar solo campos válidos de la tabla máquinas
    const permitidos = [
      "codigo", "tipo_maquina", "estado", "localidad", 
      "descripcion", "serial_maquina", "serial_billetero_1", "serial_billetero_2", "operador"
    ];

    const maquinasLimpias = maquinas.map(m => {
      const limpio = {};
      permitidos.forEach(p => {
        if (m[p] !== undefined) limpio[p] = m[p];
      });
      return limpio;
    });

    const { data, error } = await supabase
      .from("maquinas")
      .upsert(maquinasLimpias, { onConflict: 'codigo' })
      .select();

    if (error) throw error;
    res.json({ message: `${data.length} máquinas procesadas ✅`, data });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};