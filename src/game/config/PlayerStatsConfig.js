export const GLOBAL_PLAYER_MECHANICS = {
  SPRINT: {
    MULTIPLIER: 1.6, // Multiplicador de velocidad (ej: 1.6x más rápido)
    STAMINA_DRAIN_RATE: 30, // Estamina consumida por segundo al correr
    STAMINA_REGEN_RATE: 15, // Estamina recuperada por segundo al no correr/atacar
    FATIGUE_PENALTY: 0.5, // Velocidad reducida al 50% cuando la estamina llega a 0
    FATIGUE_RECOVERY: 25, // Mínimo de estamina requerida para volver a poder correr
  },
  CHARGED_ATTACK: {
    CHARGE_TIME_MS: 800, // Tiempo (en milisegundos) que hay que mantener el clic
    STAMINA_COST: 40, // Estamina que consume lanzar un ataque cargado
    DAMAGE_MULTIPLIER: 3.5, // Multiplica el daño base del zombi (mata de 1 golpe)
  },
  HORDE_MODES: {
    ATTACK: 'ATTACK_MODE', // La horda se esparce y ataca a los objetivos más cercanos
    DEFEND: 'DEFEND_MODE', // La horda forma un escudo alrededor del Zombi Líder
    FOLLOW: 'FOLLOW_MODE', // (Opcional) La horda te sigue sin atacar activamente
  },
};

export const PLAYER_TYPES = {
  COLOSO: {
    id: 'coloso',
    name: 'El Coloso',
    description: 'Un zombi masivo diseñado para romper defensas.',
    baseHealth: 400,
    baseSpeed: 200, // Muy lento
    maxStamina: 100, // Se cansa muy rápido si corre
    baseDamage: 50,
    abilityCooldown: 6000,
    spriteKey: 'zombie-walk', // Placeholder hasta que tengas su sprite real
    //animWalk: 'coloso-walk-anim',
    //animAttack: ,
    passiveDescription: 'Piel Blindada (-30% de daño recibido por proyectiles)',
  },
  ATROFIA: {
    id: 'atrofia',
    name: 'La Atrofia',
    description: 'Esbelto y ágil, caza rápidamente y esquiva el fuego enemigo.',
    baseHealth: 120, // Muy frágil
    baseSpeed: 400, // Muy rápido
    maxStamina: 250, // Puede correr por mucho tiempo
    baseDamage: 20,
    abilityCooldown: 3000,
    spriteKey: 'zombie-walk',
    //animWalk: 'atrofia-walk-anim',
    //animAttack: ,
    passiveDescription: 'Adrenalina (Recupera un 20% de estamina al infectar)',
  },
  INVOCADOR: {
    id: 'invocador',
    name: 'El Invocador',
    description: 'El núcleo de la horda. Su sola presencia corrompe a los vivos.',
    baseHealth: 200,
    baseSpeed: 300,
    maxStamina: 150,
    baseDamage: 15, // Débil cuerpo a cuerpo
    abilityCooldown: 12000,
    spriteKey: 'zombie-walk',
    //animWalk: 'invocador-walk-anim',
    //animAttack: ,
    passiveDescription: 'Aura Infecciosa (Infecta civiles automáticamente al acercarse)',
  },
  LAMENTO: {
    id: 'lamento',
    name: 'El Lamento',
    description: 'Hinchado por los gases, ataca a distancia y dispersa militares.',
    baseHealth: 160,
    baseSpeed: 250,
    maxStamina: 180,
    baseDamage: 30, // Daño por quemadura/veneno
    abilityCooldown: 100,
    spriteKey: 'zombie-walk',
    //animWalk: 'lamento-walk-anim',
    //animAttack: ,
    passiveDescription: 'Sangre Corrosiva (Explota en una nube tóxica al recibir daño o morir)',
  },
};
