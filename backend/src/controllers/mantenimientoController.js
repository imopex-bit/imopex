import { supabase } from "../config/supabase.js";

// ➕ CREAR
export const crearMantenimiento = async (req, res) => {
  const { descripcion, maquinas_id, usuarios_id } = req.body;

  try {
    const { data: mant } = await supabase
      .from("mantenimiento")
      .insert([{
        descripcion,
        maquinas_id,
        fecha: new Date()
      }])
      .select()
      .single();

    const relaciones = usuarios_id.map(uid => ({
      mantenimiento_id: mant.id,
      usuarios_id: uid
    }));

    await supabase
      .from("mantenimiento_usuarios")
      .insert(relaciones);

    res.json({ message: "Mantenimiento creado ✅" });

  } catch (err) {
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