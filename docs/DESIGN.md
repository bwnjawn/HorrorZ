# 1. Mockups

- **Pantalla de inicio:** Posee las opciones iniciales que aparecen al abrir el juego. ![Inicio](<MOCKUPS/pantalla de inicio.png>)
- **Pantalla de Autenticación (NUEVO):** Interfaz para Login y Registro de usuarios para guardar el progreso.
- **Selector de personaje:** Interfaz para elegir el tipo de líder antes de comenzar. ![Selector](<MOCKUPS/Seleccion de personaje.png>)
- **Imagen referencial del juego:** Representación visual del entorno urbano y la horda. ![Gameplay](MOCKUPS/gameplay.png)
- **Leaderboard / Ranking (NUEVO):** Pantalla que muestra los mejores puntajes globales de todos los jugadores conectados.
- **Pantalla de Game Over:** Resumen de estadísticas finales del jugador. ![Game Over](<MOCKUPS/Pantalla de muerte.png>)

# 2. Especificaciones de Tecnología y Arquitectura Fullstack

## Framework y Justificación

### Frontend

- **Base: Vue.js** El equipo técnico cuenta con experiencia previa en el ecosistema de Vue. Esto reduce el riesgo de retrasos en el aprendizaje y
  permite centrar los esfuerzos en las mecánicas del juego. Este framework se utilizará para manejar las estadísticas del juego (salud, tamaño de
  horda, bonificadores) mediante un estado reactivo.
- **Motor de Juego: Phaser** Se elige Phaser por ser el más conocido en la creación de juegos HTML. Su amplia base de usuarios y documentación extensa
  garantizan que el equipo pueda resolver bloqueos técnicos mediante soluciones ya probadas y optimizadas por la comunidad. Se utilizará para realizar
  el motor del juego, es decir, movimientos, gestión de hordas, acciones de las entidades, sonido, etc.

### Backend (Node.js + Express)

Framework para el desarrollo del servidor backend. Se implementará una API REST para gestionar la lógica persistente, la autenticación de usuarios y
la validación de puntajes.

### Base de Datos (MongoDB)

Base de datos NoSQL de tipo orientada a documentos. Almacenará los perfiles de los usuarios y el historial de partidas (tiempos de supervivencia,
tamaño máximo de horda) de forma escalable utilizando Mongoose.

## Estructura de la Base de Datos (Modelos)

### Usuario (User)

- `username` (String, único)
- `password` (String encriptado)
- `createdAt` (Date)

### Partida (Score / Match)

- `userId` (Referencia al Usuario)
- `survivalTime` (Number, en segundos)
- `maxHordeSize` (Number)
- `datePlayed` (Date)

## Endpoints Principales de la API REST

| Método | Endpoint                  | Descripción                                                                        |
| ------ | ------------------------- | ---------------------------------------------------------------------------------- |
| POST   | `/api/auth/register`      | Crea un nuevo usuario                                                              |
| POST   | `/api/auth/login`         | Autentica al usuario y devuelve un token JWT                                       |
| POST   | `/api/scores`             | Guarda los resultados de una partida al llegar a Game Over (requiere JWT)          |
| GET    | `/api/scores/leaderboard` | Retorna el top 10 de jugadores con mayor tiempo de supervivencia o tamaño de horda |

## Dependencias Principales

### Frontend

- pnpm
- Vue
- Phaser
- Vitest (pruebas unitarias)

### Backend

- Express
- Mongoose
- JsonWebToken (JWT)
- bcrypt

### Infraestructura

- Docker
- Docker Compose para levantar frontend, backend y base de datos simultáneamente.

## Estructura de carpetas actualizada

```plaintext
/
├── .github/workflows/main.yml  # CI/CD: Tests y DockerHub
├── frontend/                   # Vue + Phaser
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── game/
│   │   └── tests/
│   └── Dockerfile
├── backend/                    # Node.js + Express
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── tests/
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

# 3. Descripción del juego y Nuevas Mecánicas

**HorrorZ** es un juego de supervivencia y acción en 2D con vista top-down. El jugador asume el rol de un zombie en un entorno urbano, cuyo objetivo
es propagar la infección convirtiendo civiles y resistiendo el contraataque de las fuerzas del orden el mayor tiempo posible.

### **Mecánicas Principales**

- **Movimiento Perpetuo**: El zombi líder está en constante movimiento. El jugador no puede quedarse quieto, lo que obliga a una navegación activa por
  las calles de la ciudad.
- **Salud del personaje**: Tienes una salud limitada según el personaje que aumenta a medida que crece la horda de zombies.
- **Conversión de Horda**: Al entrar en contacto con civiles, estos se transforman y se unen a la horda que sigue al líder.
- **Escalado de Estadísticas**: A medida que la horda crece, aumentan el rango de conversión, la vida y la resistencia del zombi principal.
- **Interacción con el Entorno**: Los civiles pueden huir y esconderse dentro de las casas para evitar ser infectados. Mientras que los policías y
  militares tratan de detenerte.

### Nuevas Mecánicas o Pantallas (Solemne 3)

- **Sistema de Progresión y Ranking:** Ahora los jugadores deben registrarse. Al morir, su tiempo de supervivencia y tamaño de horda se envían a la
  base de datos para competir en un ranking global (Leaderboard).

### Reglas

- **Condición de Victoria**: El objetivo es sobrevivir la mayor cantidad de tiempo posible frente a dificultades progresivas.
- **Umbrales de Ataque**: Para eliminar unidades enemigas, se requiere una cantidad mínima de zombis en la horda.
- **Derrota**: Pierdes una vez que tu barra de salud se acaba.

### Flujo del Juego

- **Menú Principal**: Acceso a inicio, estadísticas, como se juega y configuración.
- **Gameplay**: Fase activa de infección y supervivencia en el mapa urbano.
- **Game Over**: Pantalla de estadísticas finales basada en el tiempo sobrevivido y tamaño de la horda.

# 4. Mejoras y correcciones tomadas de la evaluación de la Solemne 2

### Mejorar y agrandar el mapa

Se reemplazará el fondo temporal por un Tilemap de Phaser cargado desde Tiled (JSON), utilizando un sistema de cámaras
(`this.cameras.main.startFollow`) para navegar por una ciudad más grande.

### Crear bucle de mapa

Se implementará un efecto de "treadmill" o teletransporte en los bordes del mundo mediante `scene.physics.world.wrap` para que parezca infinito.

### Mejorar sistema de spawn

Se crearán zonas de spawn fuera de los límites de la cámara utilizando `Phaser.Math.Between`. Además, se usará un `TimerEvent` que aumentará
progresivamente la frecuencia de aparición de policías según el tiempo transcurrido.

### Mejorar diferenciación y balance de entidades

Se mejorará la iluminación y el color de las entidades.

### Implementación de sonidos

Se utilizará `this.sound.add()` de Phaser para reproducir:

- Gritos al transformar civiles.
- Disparos cuando los policías atacan.
- Sonido de zombires.

### Mejorar tiempo de evolución del juego

Se reescribirá la función de transformación para incorporar un retraso visual antes de convertir a un civil en zombi. Este retraso podrá representarse
mediante efectos de particulas.
