import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import scoreRoutes from '../routes/scoreRoutes.js';
import Score from '../models/Score.js';

// mock del middleware
vi.mock('../middleware/authMiddleware.js', () => ({
  protect: (req, res, next) => {
    req.user = { id: 'mockUserId999' };
    next();
  },
}));

vi.mock('../models/Score.js');

const app = express();

app.use(express.json());
app.use('/api/scores', scoreRoutes);

describe('Score Controller', () => {
  // Limpiamos los mocks antes de cada prueba
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/scores (saveScore)', () => {
    it('Debe guardar un nuevo puntaje y calcular el ranking exacto del jugador', async () => {
      const matchData = { survivalTime: 120, maxHordeSize: 45, victimsCount: 30 };

      Score.create.mockResolvedValue({ _id: 'partidaAniquilada777', userId: 'mockUserId999', ...matchData });
      Score.countDocuments.mockResolvedValue(2);

      const response = await request(app).post('/api/scores').send(matchData);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Puntaje guardado exitosamente');
      expect(response.body.rank).toBe(3);

      expect(Score.create).toHaveBeenCalledWith({
        userId: 'mockUserId999',
        survivalTime: 120,
        maxHordeSize: 45,
        victimsCount: 30,
      });
    });

    it('Debe responder con error 500 si la base de datos falla al intentar guardar', async () => {
      Score.create.mockRejectedValue(new Error('MongoDB Connection Timeout'));

      const response = await request(app).post('/api/scores').send({ survivalTime: 10, maxHordeSize: 2, victimsCount: 1 });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Error al guardar el puntaje');
      expect(response.body.error).toBe('MongoDB Connection Timeout');
    });
  });

  describe('GET /api/scores (getLeaderboard)', () => {
    it('Debe retornar el Top 10 global formateado correctamente', async () => {
      const mockAggregationResult = [
        {
          _id: 'user1',
          bestScore: 500,
          maxHorde: 100,
          userDetails: [{ username: 'ZombieProMaster' }],
        },
        {
          _id: 'user2',
          bestScore: 450,
          maxHorde: 80,
          userDetails: [{ username: 'InfectorChile' }],
        },
      ];

      // devuelva el array de arriba
      Score.aggregate.mockResolvedValue(mockAggregationResult);

      const response = await request(app).get('/api/scores');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toEqual({
        username: 'ZombieProMaster',
        survivalTime: 500,
        maxHordeSize: 100,
      });
      expect(response.body[1].username).toBe('InfectorChile');
    });

    it('Debe responder con error 500 si la agregación del ranking falla', async () => {
      Score.aggregate.mockRejectedValue(new Error('Pipeline error'));

      const response = await request(app).get('/api/scores');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Error al obtener el ranking');
    });
  });
});
