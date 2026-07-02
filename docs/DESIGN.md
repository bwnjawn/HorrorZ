# 1. Mockups

- **Pantalla de inicio:** Posee las opciones iniciales que aparecen al abrir el juego. ![Inicio](<./mockups/pantalla de inicio.png>)
- **Pantalla de Autenticación (NUEVO):** Interfaz para Login y Registro de usuarios para guardar el progreso.
- **Selector de personaje:** Interfaz para elegir el tipo de líder antes de comenzar. ![Selector](<./mockups/Seleccion de personaje.png>)
- **Imagen referencial del juego:** Representación visual del entorno urbano y la horda. ![Gameplay](./mockups/gameplay.png)
- **Leaderboard / Ranking (NUEVO):** Pantalla que muestra los mejores puntajes globales de todos los jugadores conectados.
- **Pantalla de Game Over:** Resumen de estadísticas finales del jugador y tributo post-créditos de las víctimas.
  ![Game Over](<./mockups/Pantalla de muerte.png>)

# 2. Descripción del juego y Nuevas Mecánicas

**HorrorZ** es un juego de supervivencia y acción en 2D con vista top-down. El jugador asume el rol de un zombie en un entorno urbano, cuyo objetivo
es propagar la infección convirtiendo civiles y resistiendo el contraataque de las fuerzas del orden el mayor tiempo posible.

### **Mecánicas Principales**

- **Movimiento Perpetuo**: El zombi líder está en constante movimiento. El jugador no puede quedarse quieto.
- **Salud del personaje**: Tienes una salud limitada según el personaje que aumenta a medida que crece la horda de zombies.
- **Conversión de Horda**: Al entrar en contacto con civiles, estos se transforman y se unen a la horda que sigue al líder.
- **Escalado de Estadísticas**: A medida que la horda crece, aumentan el rango de conversión, la vida y la resistencia del zombi principal.
- **Interacción con el Entorno**: Los civiles pueden huir para evitar ser infectados. Mientras que los policías y militares tratan de detenerte.

### Nuevas Mecánicas o Pantallas (Solemne 3)

- **Sistema de Progresión y Ranking:** Ahora los jugadores deben registrarse. Al morir, su tiempo de supervivencia y tamaño de horda se envían a la
  base de datos para competir en un ranking global (Leaderboard).
- **Tributo de Víctimas (API Externa):** Al perder, se genera un listado con los nombres e imágenes de los civiles infectados (simulando identidades
  reales), que descienden en pantalla como créditos de película.

### Reglas

- **Condición de Victoria**: El objetivo es sobrevivir la mayor cantidad de tiempo posible frente a dificultades progresivas.
- **Umbrales de Ataque**: Para eliminar unidades enemigas, se requiere una cantidad mínima de zombis en la horda.
- **Derrota**: Pierdes una vez que tu barra de salud se acaba.

### Flujo del Juego

- **Menú Principal**: Acceso a inicio, estadísticas, como se juega y configuración.
- **Gameplay**: Fase activa de infección y supervivencia en el mapa urbano.
- **Game Over**: Pantalla de estadísticas finales basada en el tiempo sobrevivido y tamaño de la horda.

# 3. Especificaciones de Tecnología y Arquitectura Fullstack

| Capa           | Tecnología / Framework | Versión | Justificación                                                         |
| -------------- | ---------------------- | ------- | --------------------------------------------------------------------- |
| Frontend UI    | Vue.js + Pinia         | ^3.5.32 | UI para menús, HUD y gestión del estado (salud, tamaño de horda).     |
| Motor de Juego | Phaser                 | ^4.1.0  | Manejo de físicas, sprites, tilemaps y mecánicas 2D.                  |
| Backend        | Node.js + Express      | v20.x   | API REST para integrar con JavaScript.                                |
| Base de Datos  | MongoDB + Mongoose     | v7.x    | Base de datos NoSQL conocida por el equipo de trabajo.                |
| Testing        | Vitest                 | ^4.1.4  | Entorno de pruebas unitarias rápido y compatible con Vue/Vite y Node. |

### Infraestructura

- Docker
- Docker Compose para levantar frontend, backend y base de datos simultáneamente.

### Diagrama de Arquitectura

```
 ┌──────────────────────────────────────────────────────────┐
 │                  JUGADOR (Navegador Web)                 │
 └────────────────────────────┬─────────────────────────────┘
                              │
                    Interacción del Usuario
                              ▼
 ┌──────────────────────────────────────────────────────────┐
 │                FRONTEND (Vue.js 3 + Phaser)              │
 │  - Controla la interfaz reactiva (HUD, menús, registro)  │
 │  - Ejecuta el motor gráfico 2D del mapa urbano           │
 └────────────────────────────┬─────────────────────────────┘
                              │
             Peticiones HTTP  │  ▲  Envío automático de
             (JSON de datos)  │  │  Cookie HTTPOnly (JWT)
                              ▼  │
 ┌──────────────────────────────────────────────────────────┐
 │                BACKEND (Node.js + Express)               │
 │  - Autentica usuarios y valida tokens de sesión          │
 │  - Controla las reglas de negocio y procesa puntajes     │
 └──────────────────────┬─────────────────────┬─────────────┘
                        │                     │
          Consultas Mongoose                  │ Peticiones REST
          (Guardar / Leer)                    │ (Lote de identidades)
                        ▼                     ▼
 ┌──────────────────────────────┐     ┌─────────────────────┐
 │    BASE DE DATOS (MongoDB)   │     │     API EXTERNA     │
 │  - Colección 'users'         │     │   (RandomUser.me)   │
 │  - Colección 'scores'        │     │  Genera datos de    │
 │    (Hordas y tiempos)        │     │  víctimas reales    │
 └──────────────────────────────┘     └─────────────────────┘
```

# 4. Integración con Servicio REST Externo

Se integrará la API gratuita **RandomUser.me** para darle profundidad narrativa a la pantalla de Game Over.

### Funcionalidad en el Juego

En la pantalla de derrota, el juego mostrará los créditos de las víctimas ("Civiles Infectados") con:

- Nombre
- Apellido
- Año de nacimiento
- Fotografía

### Endpoint Consumido

```http
GET https://randomuser.me/api/?results=200&inc=name,picture,dob
```

### Estrategia de Consumo

1. El frontend solicita las víctimas al backend.
2. El backend consume la API externa.
3. Procesa el JSON recibido.
4. Envía un arreglo limpio al cliente.

---

# 5. Estructura de carpetas actualizada

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

---

# 6. Modelo de Datos (MongoDB)

### Colección `users`

Almacena las credenciales de acceso. La autenticación utiliza cookies HTTPOnly con JWT.

| Campo     | Tipo     | Requerido | Descripción                              |
| --------- | -------- | --------- | ---------------------------------------- |
| \_id      | ObjectId | Sí        | Identificador único generado por MongoDB |
| username  | String   | Sí        | Nombre de usuario único                  |
| password  | String   | Sí        | Contraseña encriptada con Bcrypt         |
| createdAt | Date     | Sí        | Fecha de registro                        |

### Colección `scores`

Almacena el historial de partidas para el ranking global.

| Campo        | Tipo     | Requerido | Descripción                          |
| ------------ | -------- | --------- | ------------------------------------ |
| \_id         | ObjectId | Sí        | Identificador de la partida          |
| userId       | ObjectId | Sí        | Referencia al usuario                |
| survivalTime | Number   | Sí        | Tiempo de supervivencia en segundos  |
| maxHordeSize | Number   | Sí        | Tamaño máximo de la horda            |
| victimsCount | Number   | Sí        | Cantidad total de civiles infectados |
| datePlayed   | Date     | Sí        | Fecha de la partida                  |

---

# 7. Endpoints de la API REST Principal

La comunicación Frontend-Backend está protegida mediante JWT almacenados en cookies HTTPOnly.

| Método | Endpoint                  | Auth Requerida | Body (JSON)                               | Descripción                                            |
| ------ | ------------------------- | -------------- | ----------------------------------------- | ------------------------------------------------------ |
| POST   | `/api/auth/register`      | No             | `{ username, password }`                  | Crea usuario y devuelve `{ user }` + Cookie JWT        |
| POST   | `/api/auth/login`         | No             | `{ username, password }`                  | Valida credenciales y devuelve `{ user }` + Cookie JWT |
| POST   | `/api/auth/logout`        | No             | —                                         | Elimina la cookie de sesión                            |
| GET    | `/api/scores/leaderboard` | No             | —                                         | Retorna el Top 10 global                               |
| POST   | `/api/scores`             | Sí             | `{ survivalTime, maxHordeSize, victims }` | Guarda resultado de partida                            |
| GET    | `/api/victims`            | Sí             | —                                         | Devuelve víctimas procesadas desde RandomUser          |

---

# 8. Mejoras y correcciones tomadas de la evaluación de la Solemne 2

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
