import Score from '../models/Score.js';

export const saveScore = async (req, res) => {
  try {
    const { survivalTime, maxHordeSize, victimsCount } = req.body;

    // 1. Guardamos el nuevo puntaje
    const newScore = await Score.create({
      userId: req.user.id,
      survivalTime,
      maxHordeSize,
      victimsCount,
    });

    // 2. Calculamos la posición exacta (Ranking) de ESTA partida
    const higherScoresCount = await Score.countDocuments({
      $or: [{ survivalTime: { $gt: survivalTime } }, { survivalTime: survivalTime, maxHordeSize: { $gt: maxHordeSize } }],
    });

    const currentRank = higherScoresCount + 1;

    res.status(201).json({
      message: 'Puntaje guardado exitosamente',
      score: newScore,
      rank: currentRank,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al guardar el puntaje', error: error.message });
  }
};

// Obtener el Leaderboard (Top 10)
export const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await Score.aggregate([
      // 1. Agrupar por userId y encontrar el mejor puntaje (priorizando tiempo y luego horda)
      {
        $group: {
          _id: '$userId',
          bestScore: { $max: '$survivalTime' },
          maxHorde: { $max: '$maxHordeSize' },
          doc: { $first: '$$ROOT' },
        },
      },
      // 2. Ordenar
      { $sort: { bestScore: -1, maxHorde: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
    ]);

    // Formatear para el frontend
    const formattedLeaderboard = leaderboard.map((entry) => ({
      username: entry.userDetails[0]?.username || 'Jugador Desconocido',
      survivalTime: entry.bestScore,
      maxHordeSize: entry.maxHorde,
    }));

    res.json(formattedLeaderboard);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el ranking', error: error.message });
  }
};
