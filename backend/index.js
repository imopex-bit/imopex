import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  throw new Error("❌ Faltan variables de entorno");
}

const app = express();

app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// 🟢 ROOT
app.get("/", (req, res) => {
  res.send("API FUNCIONANDO 🔥");
});


// 🔐 LOGIN
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    let rol = email.toLowerCase().includes("admin") ? "admin" : "tecnico";

    res.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        rol
      }
    });

  } catch {
    res.status(401).json({ error: "Credenciales incorrectas" });
  }
});


// 📦 TODAS LAS MÁQUINAS
app.get("/maquinas", async (req, res) => {
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


// 🔥 DETALLE CON HISTORIAL (CLAVE)
app.get("/maquinas/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const { data: maquina } = await supabase
      .from("maquinas")
      .select("*")
      .eq("id", id)
      .single();

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
app.post("/maquinas", async (req, res) => {
  const {
    codigo,
    serial_maquina,
    serial_billetero
  } = req.body;

  try {
    const { data: existe } = await supabase
      .from("maquinas")
      .select("id")
      .or(
        `codigo.eq.${codigo},serial_maquina.eq.${serial_maquina},serial_billetero.eq.${serial_billetero}`
      );

    if (existe && existe.length > 0) {
      return res.status(400).json({
        error: "Código o serial ya existe ❌"
      });
    }

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

// 👤 LISTAR USUARIOS
app.get("/usuarios", async (req, res) => {
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

// 🛠️ CREAR MANTENIMIENTO (🔥 FALTABA ESTO)
app.post("/mantenimiento", async (req, res) => {
  const { descripcion, maquinas_id, usuarios_id } = req.body;

  try {
    if (!usuarios_id || usuarios_id.length === 0) {
      return res.status(400).json({ error: "Sin técnicos" });
    }

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
app.delete("/mantenimiento/:id", async (req, res) => {
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

// 🚀 SERVER
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});