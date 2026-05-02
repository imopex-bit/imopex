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
    const { data: maquina } = await supabase
      .from("maquinas")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!maquina) {
      return res.status(404).json({ error: "No existe" });
    }

    const { data: mantenimientos } = await supabase
      .from("mantenimiento")
      .select("*")
      .eq("maquinas_id", id)
      .order("fecha", { ascending: false });

    const resultado = await Promise.all(
      (mantenimientos || []).map(async (m) => {
        const { data: rel } = await supabase
          .from("mantenimiento_usuarios")
          .select("usuarios_id")
          .eq("mantenimiento_id", m.id);

        const userIds = rel?.map(r => r.usuarios_id) || [];

        let usuarios = [];

        if (userIds.length > 0) {
          const { data: usersData } = await supabase
            .from("usuarios")
            .select("nombre")
            .in("id", userIds);

          usuarios = usersData?.map(u => u.nombre) || [];
        }

        return {
          ...m,
          usuarios
        };
      })
    );

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
      ...maquina,
      mantenimientos: resultado,
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
  const { estado, localidad, descripcion, serial_maquina, serial_billetero_1, serial_billetero_2 } = req.body;

  try {
    const { data, error } = await supabase
      .from("maquinas")
      .update({ 
        estado, 
        localidad, 
        descripcion, 
        serial_maquina, 
        serial_billetero_1, 
        serial_billetero_2 
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
      "descripcion", "serial_maquina", "serial_billetero_1", "serial_billetero_2"
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