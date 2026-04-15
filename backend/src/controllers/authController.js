import { supabase } from "../config/supabase.js";

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