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

// 🔗 Supabase
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


// 📦 GET TODAS LAS MÁQUINAS
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


// 🔍 DETALLE DE MÁQUINA
app.get("/maquinas/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const { data: maquina, error } = await supabase
      .from("maquinas")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    if (!maquina) return res.status(404).json({ error: "No existe" });

    res.json(maquina);

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
    // 🔥 VALIDAR DUPLICADOS
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


// ✏️ EDITAR MÁQUINA
app.put("/maquinas/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from("maquinas")
      .update(req.body)
      .eq("id", id)
      .select();

    if (error) throw error;

    res.json({ message: "Actualizado ✅", data });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 🗑️ ELIMINAR MÁQUINA
app.delete("/maquinas/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const { error } = await supabase
      .from("maquinas")
      .delete()
      .eq("id", id);

    if (error) throw error;

    res.json({ message: "Eliminado 🗑️" });

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


// 🚀 SERVER
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});