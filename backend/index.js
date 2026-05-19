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

    res.json({
      ...maquinaLimpia,
      mantenimientos: mantenimientosFormateados
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
  const { 
    estado, 
    localidad, 
    descripcion, 
    serial_maquina, 
    serial_billetero_1, 
    serial_billetero_2 
  } = req.body;

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
});

// 👤 USUARIOS
app.get("/api/usuarios", authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("usuarios")
      .select("*");

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