import axios from 'axios';

export const getVictims = async (req, res) => {
  try {
    // Obtenemos la cantidad solicitada, por defecto 5
    const count = req.query.count || 5;
    const response = await axios.get(`https://randomuser.me/api/?results=${count}`);

    // Procesamos para extraer solo nombre, foto y fecha de nacimiento
    const victims = response.data.results.map((user) => ({
      name: `${user.name.first} ${user.name.last}`,
      photo: user.picture.large,
      dob: new Date(user.dob.date).toLocaleDateString(), // Formato legible
    }));

    res.json(victims);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener víctimas de la colmena', error: error.message });
  }
};
