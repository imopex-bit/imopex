const API = window.location.hostname === "localhost" 
  ? "http://localhost:3000/api" 
  : "https://imopex.onrender.com/api";


const getToken = () => localStorage.getItem("token");

const request = async (endpoint, options = {}) => {
  const token = getToken();

  try {
    const res = await fetch(`${API}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(options.headers || {})
      }
    });

    // 🔥 validar respuesta
    if (!res.ok) {
      if (res.status === 401) {
        localStorage.clear();
        window.location.href = "/";
        return;
      }
      const errorText = await res.text();
      throw new Error(errorText || "Error en la petición");
    }

    // 🔥 validar JSON seguro
    const data = await res.json();
    return data;

  } catch (error) {
    console.log("API ERROR:", error.message);
    throw error;
  }
};

const api = {
  get: (endpoint) => request(endpoint, { method: "GET" }),

  post: (endpoint, body) =>
    request(endpoint, {
      method: "POST",
      body: JSON.stringify(body)
    }),

  put: (endpoint, body) =>
    request(endpoint, {
      method: "PUT",
      body: JSON.stringify(body)
    }),

  delete: (endpoint) =>
    request(endpoint, { method: "DELETE" })
};

export default api;
