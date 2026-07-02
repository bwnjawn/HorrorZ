import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import authRoutes from '../routes/authRoutes.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Reemplaza este modulo y librerias
vi.mock('../models/User.js');
vi.mock('bcryptjs');
vi.mock('jsonwebtoken');

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);

describe('Auth Controller', () => {
  // Limpiamos el historial de los mocks antes de cada test.
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('Debe registrar un usuario exitosamente', async () => {
      //Simulamos lo que responden
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({ _id: '12345', username: 'nuevoZombie' });
      jwt.sign.mockReturnValue('token-falso-123');

      // Hacemos la petición HTTP simulada
      const response = await request(app).post('/api/auth/register').send({ username: 'nuevoZombie', password: '123' });

      // Comprobamos que el controlador hizo lo correcto
      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Usuario registrado exitosamente');
      expect(response.body.user.username).toBe('nuevoZombie');

      // Verificamos que se haya enviado la cookie con el token
      const cookies = response.headers['set-cookie'];

      expect(cookies).toBeDefined();
      expect(cookies[0]).toMatch(/token=token-falso-123/);

      // Verificamos que las funciones fueron llamadas con los datos correctos
      expect(User.findOne).toHaveBeenCalledWith({ username: 'nuevoZombie' });
      expect(User.create).toHaveBeenCalledWith({ username: 'nuevoZombie', password: '123' });
    });

    it('Debe devolver error 400 si el usuario ya existe', async () => {
      // Simulamos que la base de datos YA encuentra a alguien
      User.findOne.mockResolvedValue({ username: 'zombieExistente' });

      const response = await request(app).post('/api/auth/register').send({ username: 'zombieExistente', password: '123' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('El usuario ya existe');
      expect(User.create).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/auth/login', () => {
    it('Debe iniciar sesión correctamente con credenciales válidas', async () => {
      const mockUser = { _id: '12345', username: 'player1', password: 'hashedPassword' };

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('token-falso-login');

      const response = await request(app).post('/api/auth/login').send({ username: 'player1', password: 'passwordCorrecto' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Login exitoso');
      expect(response.headers['set-cookie'][0]).toMatch(/token=token-falso-login/);
    });

    it('Debe devolver error 400 si el usuario no existe', async () => {
      // Preparación: La BD no encuentra al usuario
      User.findOne.mockResolvedValue(null);

      const response = await request(app).post('/api/auth/login').send({ username: 'fantasma', password: '123' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Credenciales inválidas.');
    });

    it('Debe devolver error 400 si la contraseña es incorrecta', async () => {
      const mockUser = { _id: '12345', username: 'player1', password: 'hashedPassword' };

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false); // Contraseña mala

      const response = await request(app).post('/api/auth/login').send({ username: 'player1', password: 'passwordMalo' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Credenciales inválidas.');
    });
  });
});
