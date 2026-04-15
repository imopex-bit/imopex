import express from "express";
import cors from "cors";

import maquinasRoutes from "./routes/maquinasRoutes.js";

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

app.get("/api", (req, res) => {
  res.send("API FUNCIONANDO 🔥");
});

app.use("/api/maquinas", maquinasRoutes);

export default app;