import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import { protect } from '../middleware/authMiddleware.js';
import jwt from 'jsonwebtoken';

// mock de la liberia
vi.mock('jsonwebtoken');

const app = express();

app.use(cookieParser());
// Creamos una ruta y usamos el middleware
app.get('/test-protected', protect, (req, res) => {
  res.status(200).json({ seguro: true, user: req.user });
});

describe('Auth Middleware - protect', () => {
  // lipiar los mocks antes}
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Debe devolver 401 si no se envía ninguna cookie de token', async () => {
    const response = await request(app).get('/test-protected');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No autorizado, no hay token');
  });

  it('Debe devolver 401 si el token es inválido o está manipulado', async () => {
    jwt.verify.mockImplementation(() => {
      throw new Error('Token inválido');
    });

    const response = await request(app).get('/test-protected').set('Cookie', ['token=token-invalido-o-expirado']);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No autorizado, token inválido');
  });

  it('Debe permitir el paso (next) y setear req.user si el token es válido', async () => {
    const mockDecodedToken = { id: 'userZombie123', username: 'Nemesis' };

    jwt.verify.mockReturnValue(mockDecodedToken);

    const response = await request(app).get('/test-protected').set('Cookie', ['token=token-valido-real']);

    expect(response.status).toBe(200);
    expect(response.body.user.id).toBe('userZombie123');
    expect(jwt.verify).toHaveBeenCalledWith('token-valido-real', process.env.JWT_SECRET);
  });
});
