import { Router, Request, Response } from 'express';
import pool from './db';

export interface RegisterRequest extends Request {
  body: {
    username: string;
    password: string;
    email?: string;
  };
}

const router = Router();

// Ruta para obtener todos los usuarios
router.get('/users', async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.query('SELECT * FROM mqtt_user');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
});

// Ruta para verificar credenciales de usuario
router.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const [rows]: any = await pool.query(
      'SELECT * FROM mqtt_user WHERE username = ? AND password = SHA2(?, 256)',
      [username, password]
    );

    if (Array.isArray(rows) && rows.length > 0) {
      res.json({ success: true, message: 'Login exitoso' });
    } else {
      res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Ruta para registrar un nuevo usuario
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password, email } = req.body;

    if (!username || !password || !email) {
      res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });
      return;
    }

    // Verificar si el usuario ya existe
    const [existingUser]: any = await pool.query(
      'SELECT * FROM mqtt_user WHERE username = ?',
      [username]
    );

    if (Array.isArray(existingUser) && existingUser.length > 0) {
      res.status(400).json({ success: false, message: 'El usuario ya existe' });
      return;
    }

    // Insertar nuevo usuario con SHA-256
    await pool.query(
      'INSERT INTO mqtt_user (username, password, email) VALUES (?, SHA2(?, 256), ?)',
      [username, password, email]
    );

    res.status(201).json({ success: true, message: 'Usuario registrado con éxito' });
  } catch (error) {
    console.error('❌ Error al registrar usuario:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

/*
// Ruta para actualizar el correo electrónico de un usuario
router.put('/update-email', async (req: Request, res: Response) => {
  const { username, email } = req.body;

  try {
    const [result]: any = await pool.query(
      'UPDATE mqtt_user SET email = ? WHERE username = ?',
      [email, username]
    );

    if (result?.affectedRows > 0) {
      res.json({ success: true, message: 'Correo actualizado correctamente' });
    } else {
      res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar el correo' });
  }
});
*/
/*
router.put('/update-user', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, newEmail, newPassword } = req.body;

    if (!username || (!newEmail && !newPassword)) {
      res.status(400).json({ success: false, message: 'Debe proporcionar un usuario y al menos un campo a actualizar' });
      return;
    }

    let query = 'UPDATE mqtt_user SET ';
    const values: any[] = [];

    if (newEmail) {
      query += 'email = ?, ';
      values.push(newEmail);
    }
    
    if (newPassword) {
      query += 'password = SHA2(?, 256), ';
      values.push(newPassword);
    }

    query = query.slice(0, -2); // Elimina la última coma
    query += ' WHERE username = ?';
    values.push(username);

    const [result]: any = await pool.query(query, values);

    if (result.affectedRows > 0) {
      res.json({ success: true, message: 'Usuario actualizado correctamente' });
    } else {
      res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

  } catch (error) {
    console.error('❌ Error al actualizar usuario:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});
*/

router.put('/update-user', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, newUsername, newEmail, newPassword } = req.body;

    if (!username || (!newUsername && !newEmail && !newPassword)) {
      res.status(400).json({ success: false, message: 'Debe proporcionar un usuario y al menos un campo a actualizar' });
      return;
    }

    // Si el usuario quiere cambiar su username, primero verificamos si ya existe
    if (newUsername) {
      const [existingUser]: any = await pool.query(
        'SELECT * FROM mqtt_user WHERE username = ?',
        [newUsername]
      );

      if (Array.isArray(existingUser) && existingUser.length > 0) {
        res.status(400).json({ success: false, message: 'El nuevo nombre de usuario ya está en uso' });
        return;
      }
    }

    let query = 'UPDATE mqtt_user SET ';
    const values: any[] = [];

    if (newUsername) {
      query += 'username = ?, ';
      values.push(newUsername);
    }
    if (newEmail) {
      query += 'email = ?, ';
      values.push(newEmail);
    }
    if (newPassword) {
      query += 'password = SHA2(?, 256), ';
      values.push(newPassword);
    }

    query = query.slice(0, -2); // Elimina la última coma
    query += ' WHERE username = ?';
    values.push(username);

    const [result]: any = await pool.query(query, values);

    if (result.affectedRows > 0) {
      res.json({ success: true, message: 'Usuario actualizado correctamente. Es necesario volver a iniciar sesión.' });
    } else {
      res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

  } catch (error) {
    console.error('❌ Error al actualizar usuario:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

/*//ejemplo de Solo cambiar el email y la contraseña
{
  "username": "usuario123",
  "newEmail": "nuevo@example.com",
  "newPassword": "nuevaClave123"
}

//Cambiar el username, email y contraseña
{
  "username": "usuario123",
  "newUsername": "nuevoUsuario",
  "newEmail": "nuevo@example.com",
  "newPassword": "nuevaClave123"
}

//

*/ 
export default router;
