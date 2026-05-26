import { supabase } from "../config/supabase.js";

// 📋 LISTAR
export const getUsuarios = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("usuarios")
      .select("*");

    if (error) throw error;

    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ➕ CREAR
export const crearUsuario = async (req, res) => {
  const { nombre, email, cedula, celular, cargo } = req.body;
  
  // Lógica automática de rol
  let rol = "tecnico";
  if (cargo === "supervisor") rol = "admin";
  else if (cargo === "operador") rol = "operador";
  
  // Generar un email temporal si no se provee, ya que la base de datos lo requiere
  const emailFinal = email || `${cedula || Date.now()}@imopex.local`;

  try {
    const { data, error } = await supabase
      .from("usuarios")
      .insert([{ nombre, email: emailFinal, cedula, celular, cargo, rol }])
      .select();

    if (error) throw error;
    res.json({ message: "Usuario creado ✅", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✏️ EDITAR
export const editarUsuario = async (req, res) => {
  const { id } = req.params;
  const { nombre, email, cedula, celular, cargo } = req.body;

  // Lógica automática de rol
  let rol = "tecnico";
  if (cargo === "supervisor") rol = "admin";
  else if (cargo === "operador") rol = "operador";

  const updateData = { nombre, cedula, celular, cargo, rol };
  if (email) updateData.email = email;

  try {
    const { data, error } = await supabase
      .from("usuarios")
      .update(updateData)
      .eq("id", id)
      .select();

    if (error) throw error;
    res.json({ message: "Usuario actualizado ✅", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🗑️ ELIMINAR
export const eliminarUsuario = async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from("usuarios")
      .delete()
      .eq("id", id)
      .select();

    if (error) throw error;
    res.json({ message: "Usuario eliminado ✅" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};