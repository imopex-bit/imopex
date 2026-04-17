import { supabase } from "../config/supabase.js";

// 📦 LISTAR
export const getMantenimientos = async (req, res) => {
  try {
    const { data: mantenimientos, error } = await supabase
      .from("mantenimiento")
      .select(`
        *,
        maquinas (codigo),
        mantenimiento_usuarios (
          usuarios (nombre)
        )
      `)
      .order("fecha", { ascending: false });

    if (error) throw error;

    // Formatear para que el frontend lo entienda fácilmente
    const resultado = mantenimientos.map(m => ({
      id: m.id,
      maquina_codigo: m.maquinas?.codigo || "N/A",
      fecha: m.fecha,
      descripcion: m.descripcion,
      responsables: m.mantenimiento_usuarios?.map(mu => mu.usuarios?.nombre).filter(Boolean) || []
    }));

    res.json(resultado);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ➕ CREAR
export const crearMantenimiento = async (req, res) => {
  const { descripcion, maquinas_id, usuarios_id } = req.body;

  try {
    // 1. Insertar el mantenimiento
    const { data: mant, error: mantError } = await supabase
      .from("mantenimiento")
      .insert([{
        descripcion,
        maquinas_id,
        fecha: new Date()
      }])
      .select("id")
      .single();

    if (mantError) throw mantError;

    // 2. Relacionar con los técnicos (mantenimiento_usuarios)
    if (usuarios_id && usuarios_id.length > 0) {
      const relaciones = usuarios_id.map(uid => ({
        mantenimiento_id: mant.id,
        usuarios_id: uid
      }));

      const { error: relError } = await supabase
        .from("mantenimiento_usuarios")
        .insert(relaciones);

      if (relError) throw relError;
    }

    res.json({ message: "Mantenimiento registrado con éxito ✅", id: mant.id });

  } catch (err) {
    console.error("ERROR CREAR MANTENIMIENTO:", err);
    res.status(500).json({ error: err.message });
  }
};


// 🗑️ ELIMINAR
export const eliminarMantenimiento = async (req, res) => {
  const { id } = req.params;

  try {
    await supabase
      .from("mantenimiento_usuarios")
      .delete()
      .eq("mantenimiento_id", id);

    await supabase
      .from("mantenimiento")
      .delete()
      .eq("id", id);

    res.json({ message: "Eliminado ✅" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};