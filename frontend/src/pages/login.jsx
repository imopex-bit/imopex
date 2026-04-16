import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const data = await api.post("/auth/login", {
        email,
        password
      });

      console.log("LOGIN RESPONSE:", data);

      if (!data || !data.token) {
        setMensaje("Credenciales inválidas ❌");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setMensaje("");
      navigate("/dashboard");

    } catch (error) {
      setMensaje(error.message || "Error en login");
      console.log("LOGIN ERROR:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600">

      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-2xl shadow-xl w-80"
      >
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          🔐 Iniciar sesión
        </h2>

        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 border rounded-lg"
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-4 border rounded-lg"
        />

        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg"
        >
          Entrar
        </button>

        {mensaje && (
          <p className="text-red-500 mt-4 text-sm text-center">
            {mensaje}
          </p>
        )}
      </form>

    </div>
  );
}

export default Login;