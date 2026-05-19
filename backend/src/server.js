import app from "./app.js";

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});

// ✅ Mantener el proceso vivo — capturar cualquier error antes de que cierre el proceso
process.on("uncaughtException", (err) => {
  console.error("❌ Error no capturado:", err.message);
});

process.on("unhandledRejection", (reason) => {
  console.error("❌ Promesa rechazada:", reason);
});

// Mantener el event loop vivo
process.stdin.resume();