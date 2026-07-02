import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import victimRoutes from '../routes/victimRoutes.js';
import axios from 'axios';

// mock de librería axios
vi.mock('axios');

// Configuramos nuestra aplicación Express de prueba
const app = express();

app.use(express.json());
app.use('/api/victims', victimRoutes);

describe('Victim Controller - Integración con API Externa', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Debe obtener y procesar correctamente los datos de las víctimas', async () => {
    const mockApiResponse = {
      data: {
        results: [
          {
            name: { first: 'John', last: 'Doe' },
            picture: { large: 'https://ejemplo.com/foto-john.jpg' },
            dob: { date: '1990-05-15T00:00:00.000Z' },
          },
          {
            name: { first: 'Jane', last: 'Smith' },
            picture: { large: 'https://ejemplo.com/foto-jane.jpg' },
            dob: { date: '1985-10-20T00:00:00.000Z' },
          },
        ],
      },
    };

    axios.get.mockResolvedValue(mockApiResponse);
    const response = await request(app).get('/api/victims');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);

    expect(response.body[0]).toEqual({
      name: 'John Doe',
      photo: 'https://ejemplo.com/foto-john.jpg',
      dob: new Date('1990-05-15T00:00:00.000Z').toLocaleDateString(),
    });
    expect(axios.get).toHaveBeenCalledWith('https://randomuser.me/api/?results=5');
  });

  it('Debe solicitar la cantidad exacta de víctimas si se envía el parámetro count', async () => {
    axios.get.mockResolvedValue({ data: { results: [] } });
    const response = await request(app).get('/api/victims?count=20');

    expect(response.status).toBe(200);
    expect(axios.get).toHaveBeenCalledWith('https://randomuser.me/api/?results=20');
  });

  it('Debe devolver error 500 si la API externa (RandomUser) está caída', async () => {
    axios.get.mockRejectedValue(new Error('Network Error or API Down'));
    const response = await request(app).get('/api/victims');

    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Error al obtener víctimas de la colmena');
    expect(response.body.error).toBe('Network Error or API Down');
  });
});
