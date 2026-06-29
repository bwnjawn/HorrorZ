import Score from '../models/Score.js';

export const saveScore = async (req, res) => {
  try {
    const { survivalTime, maxHordeSize, victimsCount } = req.body;

    const newScore = await Score.create({
      userId: req.user.id, // Viene inyectado por el authMiddleware
      survivalTime,
      maxHordeSize,
      victimsCount,
    });

    res.status(201).json({ message: 'Puntaje guardado exitosamente', score: newScore });
  } catch (error) {
    res.status(500).json({ message: 'Error al guardar el puntaje', error: error.message });
  }
};

// Obtener el Leaderboard (Top 10)
export const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await Score.find().sort({ survivalTime: -1, maxHordeSize: -1 }).limit(10).populate('userId', 'username');

    // Mapeamos los datos para entregar un JSON más limpio al frontend
    const formattedLeaderboard = leaderboard.map((entry) => ({
      id: entry._id,
      username: entry.userId ? entry.userId.username : 'Jugador Desconocido',
      survivalTime: entry.survivalTime,
      maxHordeSize: entry.maxHordeSize,
      victimsCount: entry.victimsCount,
      datePlayed: entry.datePlayed,
    }));

    res.status(200).json(formattedLeaderboard);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el leaderboard', error: error.message });
  }
};
