import { supabase } from "../config/supabase.js";

// 🔐 LOGIN
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (!data.session) {
      return res.status(401).json({ error: "No se pudo obtener sesión ❌" });
    }

    const rol = email.toLowerCase().includes("admin") ? "admin" : "tecnico";

    res.json({
      token: data.session.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        rol
      }
    });

  } catch {
    res.status(401).json({ error: "Credenciales incorrectas ❌" });
  }
};


// 📝 REGISTER
export const register = async (req, res) => {
  const { nombre, email, password } = req.body;

  try {
    // 1. Registro en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    // 2. Insertar en nuestra tabla de usuarios (para perfiles)
    const { error: dbError } = await supabase
      .from("usuarios")
      .insert([{ 
        id: authData.user.id, 
        nombre, 
        email 
      }]);

    if (dbError) throw dbError;

    res.json({ message: "Usuario registrado con éxito ✅" });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};