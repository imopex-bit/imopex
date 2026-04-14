const data = await api.get("/maquinas");

await api.post("/maquinas", body);

await api.delete(`/maquinas/${id}`);