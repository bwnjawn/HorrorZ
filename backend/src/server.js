import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Ruta base
app.get('/', (req, res) => {
  res.json({ message: 'API de HorrorZ operativa' });
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
