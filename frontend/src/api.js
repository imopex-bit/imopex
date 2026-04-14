const API = "https://imopex.onrender.com/api";

// 🔐 obtener token
const getToken = () => {
  return localStorage.getItem("token");
};

// 🔥 request base
const request = async (endpoint, options = {}) => {
  const token = getToken();

  const res = await fetch(`${API}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {})
    }
  });

  // 🔐 si expira sesión
  if (res.status === 401) {
    localStorage.clear();
    window.location.href = "/";
    return;
  }

  const data = await res.json();
  return data;
};

// 🔹 GET
export const apiGet = (endpoint) => {
  return request(endpoint, { method: "GET" });
};

// 🔹 POST
export const apiPost = (endpoint, body) => {
  return request(endpoint, {
    method: "POST",
    body: JSON.stringify(body)
  });
};

// 🔹 PUT
export const apiPut = (endpoint, body) => {
  return request(endpoint, {
    method: "PUT",
    body: JSON.stringify(body)
  });
};

// 🔹 DELETE
export const apiDelete = (endpoint) => {
  return request(endpoint, {
    method: "DELETE"
  });
};