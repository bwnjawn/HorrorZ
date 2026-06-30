import jwt from 'jsonwebtoken';

export const protect = (req, res, next) => {
  // Extraern token de las cookies
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'No autorizado, no hay token' });
  }

  try {
    // verificacion de token valido
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'No autorizado, token inválido' });
  }
};
