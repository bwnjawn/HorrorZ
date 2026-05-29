# HorrorZ

**HorrorZ** es un juego de supervivencia y acción en 2D con vista top-down. El jugador asume el rol de un zombie en un entorno urbano, cuyo objetivo
es propagar la infección convirtiendo civiles y resistiendo el contraataque de las fuerzas del orden el mayor tiempo posible.

## Tecnologías principales

- **Frontend:** Vue 3 y Phaser
- **Estado:** Pinia
- **Bundler/Dev Server:** Vite
- **Gestor de paquetes:** pnpm (lockfile: `pnpm-lock.yaml`)
- **Linter:** ESLint & Prettier

## Ejecutar la aplicación localmente

1. Clona el repositorio:

```bash
git clone <https://github.com/bwnjawn/HorrorZ.git>
cd horrorz
```

2. Instalar pnpm si no está activo:

```bash
npm install -g pnpm
```

3. Instala dependencias y ejecuta en modo desarrollo:

```bash
pnpm install
pnpm run dev
```

4. Abre `http://localhost:5173`

---

## Construir para producción

```bash
pnpm run build
pnpm run preview
```

---

## Ejecutar con Docker

### Construir la imagen

Asegúrate de tener abierto Docker y estar en la raíz del proyecto, luego ejecuta:

```bash
docker build -t benjam1wn/horrorz:latest .
```

### Ejecutar el contenedor (puerto 8080)

```bash
docker run -d --rm -p 8080:80 benjam1wn/horrorz:latest
```

Se abrirá la aplicación en `http://localhost:8080`.

---

## Imagen en DockerHub

https://hub.docker.com/r/benjam1wn/horrorz

```

```
