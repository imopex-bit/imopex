import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  throw new Error("❌ Faltan variables de entorno");
}

const app = express();

// 🔥 CORS (permite tu frontend y previews de Vercel)
app.use(cors({
  origin: true
}));

app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// 🔐 MIDDLEWARE AUTH
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "No autorizado ❌" });
  }

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return res.status(401).json({ error: "Token inválido ❌" });
  }

  req.user = data.user;
  next();
};

// 🟢 ROOT
app.get("/api", (req, res) => {
  res.send("API FUNCIONANDO 🔥");
});

// 🔐 LOGIN
app.post("/api/login", async (req, res) => {
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

    // 🔥 DEVOLVER TOKEN CORRECTO
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
});

// 📦 TODAS LAS MÁQUINAS
app.get("/api/maquinas", authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("maquinas")
      .select("*");

    if (error) throw error;

    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔥 DETALLE
app.get("/api/maquinas/:id", authMiddleware, async (req, res) => {
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

    res.json({
      ...maquina,
      mantenimientos: resultado
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ➕ CREAR MÁQUINA
app.post("/api/maquinas", authMiddleware, async (req, res) => {
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
});

// ✏️ EDITAR MÁQUINA
app.put("/api/maquinas/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { estado, localidad } = req.body;

  try {
    const { data, error } = await supabase
      .from("maquinas")
      .update({ estado, localidad })
      .eq("id", id)
      .select();

    if (error) throw error;

    res.json({ message: "Actualizado ✅", data });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 👤 USUARIOS
app.get("/api/usuarios", authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("usuarios")
      .select("id, nombre");

    if (error) throw error;

    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🛠️ CREAR MANTENIMIENTO
app.post("/api/mantenimiento", authMiddleware, async (req, res) => {
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
});

// 🗑️ ELIMINAR MANTENIMIENTO
app.delete("/api/mantenimiento/:id", authMiddleware, async (req, res) => {
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
});

// 🗑️ ELIMINAR MÁQUINA
app.delete("/api/maquinas/:id", authMiddleware, async (req, res) => {
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
});

// 🚀 SERVER
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});