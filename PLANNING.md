# **Semana 1: Diseño, Configuración y Cimientos**

**Objetivo:** Establecer la arquitectura del proyecto y los documentos de diseño iniciales.

**Tareas Planificadas:**

- Finalización y carga de los archivos DESIGN.md y PLANNING.md.
- Configuración del repositorio en GitHub con .gitignore adecuado.
- Definición de la estructura de carpetas.

# **Semana 2: Mecánicas de Movimiento e Infección**

**Objetivo:** Implementar el bucle de juego principal y la lógica de la horda.

**Tareas Planificadas:**

- **Configuración técnica**: Integración base de Vue.js con el lienzo de Phaser.
- **Creación de Texturas Base**: Diseño de los _tilesets_ urbanos (calles, aceras) y el sprite del "Zombi Líder".
- **Entorno Inicial**: Creación del mapa urbano con cajas de colisión para edificios y obstáculos.
- **Mecánica de Movimiento**: Programación del movimiento perpetuo del zombi líder.
- **Lógica de Infección**: Implementación de la conversión de civiles (usando _placeholders_ visuales temporales).

- **Fase de Prueba:** Verificación de la correcta carga de texturas en el lienzo de Phaser y validación del mapa de colisiones.

# **Semana 3: Horda, entidades y texturas**

**Objetivo:** Desarrollar los comportamientos avanzados de la horda y el arte de todos los personajes.

**Tareas Planificadas:**

- **Diseño de Sprites**: Creación de texturas para civiles (incluyendo estados de transformación), policías y militares.
- **Gestión de Horda**: Lógica para que los zombis sigan al líder y aumenten sus estadísticas (vida, resistencia, rango).
- **Entidades**: Programación de civiles que huyen/se esconden y fuerzas del orden con predicción de movimiento.
- **Efectos Visuales**: Creación de texturas para proyectiles, disparos y el indicador visual de peligro.
- **Interfaz (HUD)**: Desarrollo en Vue de las barras de salud, contador de horda y cooldown de habilidades.

**Fase de Prueba:** Balanceo de combate y verificación de los umbrales de ataque necesarios para derrotar a los enemigos.

# **Semana 4: Pulido, DevOps y Entrega Final**

**Objetivo:** Asegurar la calidad técnica, pruebas finales y despliegue automatizado.

- **Tareas Planificadas:**

- **Menús Finales**: Implementación de la pantalla de inicio, selector de personaje y Game Over con sus texturas finales.
- **Pruebas Unitarias**: Implementación de tests con **Vitest** para validar la lógica del juego.
- **Dockerización**: Creación del Dockerfile para contenerizar la aplicación.
- **GitHub Actions**: Configuración de main.yml para ejecutar tests y actualizar el contenedor en DockerHub.
- **README**: Redacción de instrucciones detalladas de ejecución local y vía Docker.

- **Fase de Prueba:** Verificación de robustez en Chrome, Firefox y Safari antes del cierre de la evaluación.
