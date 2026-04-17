# 📋 IMOPEX - Sistema de Gestión de Máquinas

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-ISC-green)
![Node](https://img.shields.io/badge/node-%3E%3D14-brightgreen)

> Sistema integral para la administración de máquinas, mantenimientos y usuarios responsables.

## 📑 Tabla de Contenidos

- [Características](#características)
- [Stack Tecnológico](#stack-tecnológico)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Uso](#uso)
- [API REST](#api-rest)
- [Base de Datos](#base-de-datos)
- [Observaciones](#observaciones)
- [Recomendaciones](#recomendaciones)
- [Contribuir](#contribuir)

---

## ✨ Características

- 🤖 **Gestión Completa de Máquinas:** CRUD con estado y localidad
- 🔧 **Registro de Mantenimientos:** Historial de servicios realizados
- 👥 **Asignación de Usuarios:** Múltiples usuarios por mantenimiento
- 🔐 **Autenticación JWT:** (Implementado pero no aplicado en rutas)
- 🌐 **API REST:** Endpoints para todas las operaciones
- 📍 **Localización:** Registro de ubicación de máquinas
- 📊 **Relaciones Complejas:** Arquitectura de BD relacional

---

## 🛠️ Stack Tecnológico

### Backend

| Tecnología | Versión | Propósito |
|---|---|---|
| **Node.js** | LTS | Runtime de JavaScript |
| **Express.js** | ^5.2.1 | Framework web/API REST |
| **Supabase** | ^2.103.0 | Base de datos PostgreSQL + ORM |
| **JWT** | ^9.0.3 | Autenticación y autorización |
| **CORS** | ^2.8.6 | Gestión de solicitudes cross-origin |
| **Dotenv** | ^17.4.1 | Variables de entorno |

### Arquitectura

```
Patrón: MVC (Modelo-Vista-Controlador)
┌─────────────────────────────────────┐
│         Cliente (Frontend)          │
└──────────────┬──────────────────────┘
               │ HTTP Request
┌──────────────▼──────────────────────┐
│         Express Server              │
│  ├─ Rutas (Routes)                  │
│  ├─ Controladores (Controllers)     │
│  └─ Middleware                      │
└──────────────┬──────────────────────┘
               │ Supabase Client
┌──────────────▼──────────────────────┐
│      PostgreSQL (Supabase)          │
│  ├─ Maquinas                        │
│  ├─ Mantenimientos                  │
│  ├─ Usuarios                        │
│  └─ Mantenimiento_Usuarios (Pivote) │
└─────────────────────────────────────┘
```

---

## 📁 Estructura del Proyecto

```
imopex/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── supabase.js              # Configuración de Supabase
│   │   ├── controllers/
│   │   │   ├── authController.js        # Controlador de autenticación
│   │   │   ├── maquinasController.js    # CRUD de máquinas
│   │   │   ├── mantenimientoController.js
│   │   │   └── usuariosController.js
│   │   ├── middlewares/
│   │   │   └── authMiddleware.js        # Middleware de autenticación
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── maquinasRoutes.js
│   │   │   ├── mantenimientoRoutes.js
│   │   │   └── usuariosRoutes.js
│   │   ├── app.js                       # Configuración de Express
│   │   └── server.js                    # Punto de entrada
│   ├── package.json                     # Dependencias
│   ├── .env                            # Variables de entorno (NO INCLUIR)
│   └── .gitignore
└── frontend/                            # Aplicación React
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── api.js
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    ├── vite.config.js
    └── tailwind.config.js
```

---

## 📦 Instalación

### Requisitos Previos

- Node.js >= 14
- npm o yarn
- Cuenta en Supabase

### Pasos de Instalación

#### 1. Clonar el repositorio
```bash
git clone https://github.com/usuario/imopex.git
cd imopex
```

#### 2. Configurar Backend

```bash
cd backend
npm install
```

#### 3. Configurar Frontend

```bash
cd ../frontend
npm install
```

#### 4. Crear archivos de configuración
```bash
# En backend/
cp .env.example .env
```

#### 5. Iniciar la aplicación

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

El servidor estará disponible en:
- **Backend:** `http://localhost:3000`
- **Frontend:** `http://localhost:5173`

---

## ⚙️ Configuración

### Variables de Entorno (.env)

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key

# JWT
JWT_SECRET=your-secret-key

# Server
PORT=3000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Configuración de Supabase (config/supabase.js)

```javascript
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);
```

---

## 🚀 Uso

### Iniciar Servidor en Desarrollo

```bash
npm start
```

Salida esperada:
```
✅ Servidor corriendo en puerto 3000
```

### Estructura de una Solicitud

```javascript
// Ejemplo con fetch
const response = await fetch("http://localhost:3000/api/maquinas", {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer token_jwt_aqui"
  }
});

const data = await response.json();
```

---

## 🔌 API REST

### 📋 Listar Máquinas

```http
GET /api/maquinas
```

**Response (200):**
```json
[
  {
    "id": 1,
    "estado": "activo",
    "localidad": "Almacén A",
    "descripcion": "Máquina de producción",
    "created_at": "2026-04-16T10:00:00Z"
  }
]
```

---

### 🔍 Obtener Detalle de Máquina

```http
GET /api/maquinas/:id
```

**Response (200):**
```json
{
  "id": 1,
  "estado": "activo",
  "localidad": "Almacén A",
  "descripcion": "Máquina de producción",
  "mantenimientos": [
    {
      "id": 1,
      "fecha": "2026-04-15",
      "descripcion": "Mantenimiento preventivo",
      "usuarios": ["Juan García", "María López"]
    }
  ]
}
```

**Response (404):**
```json
{
  "error": "No existe"
}
```

---

### ➕ Crear Máquina

```http
POST /api/maquinas
Content-Type: application/json

{
  "estado": "activo",
  "localidad": "Almacén B",
  "descripcion": "Nueva máquina CNC"
}
```

**Response (200):**
```json
{
  "message": "Creado ✅",
  "data": {
    "id": 2,
    "estado": "activo",
    "localidad": "Almacén B",
    "descripcion": "Nueva máquina CNC"
  }
}
```

---

### ✏️ Editar Máquina

```http
PUT /api/maquinas/:id
Content-Type: application/json

{
  "estado": "mantenimiento",
  "localidad": "Taller",
  "descripcion": "En revisión"
}
```

**Response (200):**
```json
{
  "message": "Actualizado ✅",
  "data": {
    "id": 1,
    "estado": "mantenimiento",
    "localidad": "Taller",
    "descripcion": "En revisión"
  }
}
```

---

### 🗑️ Eliminar Máquina

```http
DELETE /api/maquinas/:id
```

**Response (200):**
```json
{
  "message": "Máquina eliminada ✅"
}
```

**Response (400):**
```json
{
  "error": "No se eliminó"
}
```

---

## 🗄️ Base de Datos

### Modelo Entidad-Relación

```
┌─────────────────┐
│    maquinas     │
├─────────────────┤
│ id (PK)         │
│ estado          │
│ localidad       │
│ descripcion     │
│ created_at      │
│ updated_at      │
└────────┬────────┘
         │ 1:N
         │
┌────────▼────────────────────┐
│    mantenimiento            │
├─────────────────────────────┤
│ id (PK)                     │
│ maquinas_id (FK)            │
│ fecha                       │
│ descripcion                 │
│ created_at                  │
└────────┬────────────────────┘
         │ N:N
         │
┌────────▼──────────────────────────┐
│  mantenimiento_usuarios (Pivote)  │
├───────────────────────────────────┤
│ id (PK)                           │
│ mantenimiento_id (FK)             │
│ usuarios_id (FK)                  │
└───────────┬──────────┬────────────┘
            │          │
      ┌─────▼──────────▼──┐
      │     usuarios      │
      ├───────────────────┤
      │ id (PK)           │
      │ nombre            │
      │ email             │
      │ created_at        │
      └───────────────────┘
```

### SQL de Referencia

```sql
-- Crear tabla maquinas
CREATE TABLE maquinas (
  id BIGSERIAL PRIMARY KEY,
  estado VARCHAR(50),
  localidad VARCHAR(100),
  descripcion TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear tabla mantenimiento
CREATE TABLE mantenimiento (
  id BIGSERIAL PRIMARY KEY,
  maquinas_id BIGINT REFERENCES maquinas(id),
  fecha DATE,
  descripcion TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Crear tabla usuarios
CREATE TABLE usuarios (
  id BIGSERIAL PRIMARY KEY,
  nombre VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Crear tabla pivote
CREATE TABLE mantenimiento_usuarios (
  id BIGSERIAL PRIMARY KEY,
  mantenimiento_id BIGINT REFERENCES mantenimiento(id),
  usuarios_id BIGINT REFERENCES usuarios(id),
  UNIQUE(mantenimiento_id, usuarios_id)
);
```

---

## ⚠️ Observaciones Críticas

### 1. ❌ Validación de Entrada Ausente
Actualmente no hay validación de datos del cliente. Cualquier valor se envía a la BD.

```javascript
// PROBLEMA: Sin validación
export const crearMaquina = async (req, res) => {
  const { data, error } = await supabase
    .from("maquinas")
    .insert([req.body])  // ❌ Riesgo de inyección SQL
```

### 2. ❌ Autenticación No Implementada
JWT se importa pero no se usa en las rutas.

```javascript
import jsonwebtoken from "jsonwebtoken"; // Importado pero NUNCA usado
```

### 3. ⚠️ Problema N+1 Queries
En `getMaquinaDetalle`, se hace una query por cada mantenimiento.

```javascript
// INEFICIENTE: N queries adicionales
(mantenimientos || []).map(async (m) => {
  const { data: rel } = await supabase
    .from("mantenimiento_usuarios")
    .select("usuarios_id")
    .eq("mantenimiento_id", m.id);  // Query N veces
```

### 4. ⚠️ Sin Paginación
`getMaquinas` devuelve TODOS los registros sin límite.

### 5. ❌ Sin Testing
Cero cobertura de tests unitarios e integración.

### 6. ⚠️ Manejo de Errores Genérico
Solo devuelve `err.message` sin contexto.

---

## 💡 Recomendaciones

### 🔴 ALTA PRIORIDAD

#### 1. Agregar Validación con ZOD

```bash
npm install zod
```

```javascript
// validators/maquinas.js
import { z } from "zod";

export const crearMaquinaSchema = z.object({
  estado: z.string().min(1, "Estado requerido"),
  localidad: z.string().min(1, "Localidad requerida"),
  descripcion: z.string().optional()
});

// Uso en controlador
export const crearMaquina = async (req, res) => {
  const validacion = crearMaquinaSchema.safeParse(req.body);
  if (!validacion.success) {
    return res.status(400).json({ 
      error: "Datos inválidos",
      detalles: validacion.error.errors 
    });
  }
  
  // ... resto del código
};
```

#### 2. Implementar Middleware de Autenticación

```javascript
// middleware/auth.js
import jwt from "jsonwebtoken";

export const verificarToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Token inválido" });
  }
};

// Aplicar en rutas
import { verificarToken } from "./middleware/auth.js";

app.delete("/api/maquinas/:id", verificarToken, eliminarMaquina);
```

#### 3. Optimizar Queries (Eliminar N+1)

```javascript
// Usar joins de Supabase
export const getMaquinaDetalle = async (req, res) => {
  const { id } = req.params;

  try {
    const { data: resultado, error } = await supabase
      .from("maquinas")
      .select(`
        *,
        mantenimiento (
          *,
          mantenimiento_usuarios (
            usuarios(nombre)
          )
        )
      `)
      .eq("id", id)
      .single();

    if (!resultado) {
      return res.status(404).json({ error: "No existe" });
    }

    res.json(resultado);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
```

### 🟡 MEDIA PRIORIDAD

#### 4. Agregar Paginación

```javascript
export const getMaquinas = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { data, count, error } = await supabase
      .from("maquinas")
      .select("*", { count: "exact" })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.json({
      data,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
```

#### 5. Centralizar Manejo de Errores

```bash
npm install winston
```

```javascript
// middleware/errorHandler.js
import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: "logs/error.log" }),
    new winston.transports.File({ filename: "logs/combined.log" })
  ]
});

export const errorHandler = (err, req, res, next) => {
  logger.error(err);
  
  const status = err.status || 500;
  const message = err.message || "Error interno del servidor";
  
  res.status(status).json({
    error: message,
    status,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
};

// Aplicar en server.js
app.use(errorHandler);
```

#### 6. Agregar Documentación con Swagger

```bash
npm install swagger-jsdoc swagger-ui-express
```

```javascript
// swagger.js
import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "IMOPEX API",
      version: "1.0.0",
      description: "API de gestión de máquinas"
    },
    servers: [
      { url: "http://localhost:3000", description: "Desarrollo" }
    ]
  },
  apis: ["./src/routes/*.js"]
};

export const swaggerSpec = swaggerJsdoc(options);
```

### 🟢 BAJA PRIORIDAD

#### 7. Agregar Tests

```bash
npm install --save-dev jest supertest
```

```javascript
// tests/maquinas.test.js
import request from "supertest";
import app from "../src/server.js";

describe("GET /api/maquinas", () => {
  it("debe devolver lista de máquinas", async () => {
    const response = await request(app).get("/api/maquinas");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
```

#### 8. Configurar Environment por Etapa

```bash
.env.development
.env.staging
.env.production
```

---

## 🔄 Flujo de Datos

```
┌────────────────────────────────────────────────────────────┐
│                    Frontend/Cliente                        │
└────────────────┬─────────────────────────────────────────┘
                 │ HTTP Request + JWT Token
┌────────────────▼─────────────────────────────────────────┐
│          Middleware Express                               │
│  ├─ CORS Handler                                          │
│  ├─ JSON Parser                                           │
│  └─ Auth Validator (JWT)                                  │
└────────────────┬─────────────────────────────────────────┘
                 │
┌────────────────▼─────────────────────────────────────────┐
│          Router / Route Handler                           │
│  └─ /api/maquinas/:id                                     │
└────────────────┬─────────────────────────────────────────┘
                 │
┌────────────────▼─────────────────────────────────────────┐
│          Controller (maquinasController.js)               │
│  ├─ Validar entrada                                       │
│  ├─ Lógica de negocio                                     │
│  └─ Llamar a Supabase                                     │
└────────────────┬─────────────────────────────────────────┘
                 │ Supabase Query
┌────────────────▼─────────────────────────────────────────┐
│          PostgreSQL (Supabase)                            │
│  ├─ SELECT * FROM maquinas WHERE id = ?                   │
│  ├─ SELECT * FROM mantenimiento WHERE maquinas_id = ?     │
│  └─ SELECT * FROM usuarios WHERE id IN (?, ?, ...)       │
└────────────────┬─────────────────────────────────────────┘
                 │ Resultados
┌────────────────▼─────────────────────────────────────────┐
│          Controller (Formatear respuesta)                 │
└────────────────┬─────────────────────────────────────────┘
                 │ JSON Response
┌────────────────▼─────────────────────────────────────────┐
│                    Frontend/Cliente                       │
└────────────────────────────────────────────────────────────┘
```

---

## 📊 Estadísticas del Proyecto

| Métrica | Estado |
|---|---|
| **Funcionalidades Completadas** | 5/5 CRUD ✅ |
| **Validación** | ❌ No implementada |
| **Autenticación** | ⚠️ Parcial (JWT sin usar) |
| **Testing** | ❌ No hay tests |
| **Documentación API** | ❌ Sin Swagger |
| **Paginación** | ❌ No implementada |
| **Optimización BD** | ⚠️ N+1 Problem |
| **Prod-Ready** | ❌ No |
| **Madurez** | MVP (Minimum Viable Product) |

---

## 🚦 Estado del Proyecto

```
Desarrollo: ████████░░ 80%
Testing:    ░░░░░░░░░░  0%
Producción: ░░░░░░░░░░  0%
```

---

## 📝 Checklist de Implementación

- [ ] Validación de entrada con ZOD
- [ ] Middleware de autenticación JWT
- [ ] Optimizar queries (eliminar N+1)
- [ ] Agregar paginación
- [ ] Centralizar error handler
- [ ] Agregar logging (Winston)
- [ ] Documentación Swagger
- [ ] Tests unitarios
- [ ] Tests de integración
- [ ] Redeploy y setup en producción

---

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la licencia ISC. Ver archivo `LICENSE` para más detalles.

---

## 👨‍💻 Autor

**IMOPEX Development Team**
- Proyecto: Sistema de Gestión de Máquinas
- Versión: 1.0.0
- Fecha de Análisis: 16 de Abril, 2026

---

## 📞 Soporte

Para soporte, abrir un issue en el repositorio o contactar al equipo de desarrollo.

---

## 🔗 Enlaces Útiles

- [Documentación de Express](https://expressjs.com/)
- [Documentación de Supabase](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [JWT Introduction](https://jwt.io/introduction)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)

---

**Última actualización:** 16 de Abril, 2026
**Generado por:** GitHub Copilot (Claude Haiku 4.5)
