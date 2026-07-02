# HorrorZ

**HorrorZ** es un juego de supervivencia y acción en 2D con vista *top-down*. El jugador asume el rol de un zombie en un entorno urbano, cuyo objetivo es propagar la infección convirtiendo civiles y resistiendo el contraataque de las fuerzas del orden el mayor tiempo posible.

En su versión más reciente, el proyecto ha evolucionado a una arquitectura **Fullstack**, integrando un backend RESTful y una base de datos, lo que permite el registro de usuarios, autenticación segura y un sistema de ranking global (*Leaderboard*). Además, incorpora la API externa **RandomUser.me** para generar un tributo realista de los civiles infectados en la pantalla de *Game Over*.

---

## Tecnologías Utilizadas

### Frontend

- **Framework y UI:** Vue.js 3
- **Gestión de Estado:** Pinia
- **Motor Gráfico:** Phaser 3
- **Bundler:** Vite

### Backend y Base de Datos

- **Entorno de ejecución:** Node.js
- **Framework Backend:** Express
- **Base de Datos:** MongoDB
- **ODM:** Mongoose
- **Autenticación:** JWT mediante cookies HTTPOnly
- **Encriptación:** Bcrypt

### Herramientas y DevOps

- **Gestor de paquetes:** pnpm (`pnpm-lock.yaml`)
- **Linter y Formateo:** ESLint y Prettier
- **Testing:** Vitest
- **Contenedorización:** Docker y Docker Compose
- **CI/CD:** GitHub Actions

---

## Ejecución Local (Modo Desarrollo)

### Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

1. **Node.js** (v20.x recomendado)
2. **pnpm**

```bash
npm install -g pnpm
```

3. Una instancia de **MongoDB** ejecutándose localmente en el puerto `27017`.

---

### 1. Clonar el Repositorio

```bash
git clone https://github.com/bwnjawn/HorrorZ.git
cd HorrorZ
```

### 2. Instalar Dependencias

```bash
pnpm install
```

### 3. Configurar Variables de Entorno (Backend)

Crea un archivo `.env` dentro del directorio `backend`:

```env
JWT_SECRET=tu_secreto_super_seguro
PORT=5000
MONGO_URI=mongodb://localhost:27017/horrorz
```

### 4. Ejecutar el Backend

Desde una terminal ubicada en la raíz del proyecto:

```bash
cd backend
pnpm run dev
```

El servidor backend estará disponible en:

```text
http://localhost:5000
```

### 5. Ejecutar el Frontend

Abre una segunda terminal en la raíz del proyecto y ejecuta:

```bash
cd frontend
pnpm run dev
```

El juego estará disponible en:

```text
http://localhost:5173
```

---

## Ejecución con Docker Compose

Para levantar toda la infraestructura (Frontend, Backend y Base de Datos) mediante contenedores Docker.

### Requisitos

- Docker Desktop (Windows/macOS) o Docker Engine (Linux) instalado.
- Docker en ejecución.

### 1. Configurar Variables de Entorno

En la raíz del proyecto, crea un archivo `.env` con al menos la siguiente variable:

```env
JWT_SECRET= tu_clave
```

### 2. Construir y Levantar los Contenedores

Desde la raíz del proyecto:

```bash
docker compose up -d --build
```

### 3. Acceder a la Aplicación

| Servicio | URL / Puerto |
|-----------|-------------|
| Frontend | http://localhost:8080 |
| Backend | http://localhost:5000 |
| MongoDB | Puerto 27017 |


### Detener los Servicios

```bash
docker compose down
```

---

## Testing y Calidad de Código

### Ejecutar Pruebas Unitarias

#### Frontend

```bash
cd frontend
pnpm run test
```

#### Backend

```bash
cd backend
pnpm run test
```

### Ejecutar el Linter

Desde la raíz del proyecto:

```bash
pnpm run lint
```

### Ejecutar el Formatter

Desde la raíz del proyecto:

```bash
pnpm run format
```
---

## CI/CD

Las imágenes Docker de producción se construyen y publican automáticamente mediante flujos de trabajo de **GitHub Actions** cada vez que se realiza un *push* a la rama principal.
## Docker Hub
- **Imagen del Frontend:** [https://hub.docker.com/r/benjam1wn/horrorz-frontend](https://hub.docker.com/r/benjam1wn/horrorz-frontend)
- **Imagen del Backend:** [https://hub.docker.com/r/benjam1wn/horrorz-backend](https://hub.docker.com/r/benjam1wn/horrorz-backend)

