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
    res.status(500).json({ message: 'Error getting users' });
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
      res.json({ success: true, message: 'Login Successful' });
    } else {
      res.status(401).json({ success: false, message: 'Incorrect credentials' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Ruta para registrar un nuevo usuario
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password, email } = req.body;

    if (!username || !password || !email) {
      res.status(400).json({ success: false, message: 'All fields are required' });
      return;
    }

    // Verificar si el usuario ya existe
    const [existingUser]: any = await pool.query(
      'SELECT * FROM mqtt_user WHERE username = ?',
      [username]
    );

    if (Array.isArray(existingUser) && existingUser.length > 0) {
      res.status(400).json({ success: false, message: 'The user already exists' });
      return;
    }

    // Insertar nuevo usuario con SHA-256
    await pool.query(
      'INSERT INTO mqtt_user (username, password, email) VALUES (?, SHA2(?, 256), ?)',
      [username, password, email]
    );

    res.status(201).json({ success: true, message: 'Successful Registered User' });
  } catch (error) {
    console.error('❌ Error al registrar usuario:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});


router.put('/update-user', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, newUsername, newEmail, newPassword, currentPassword } = req.body;

    if (!username&&!currentPassword || (!newUsername && !newEmail && !newPassword)) {
      res.status(400).json({ success: false, message: 'You must provide a username and password and some other field to update' });
      return;
    }
    //--
    const [rows]: any = await pool.query(
      'SELECT * FROM mqtt_user WHERE username = ? AND password = SHA2(?, 256)',
      [username, currentPassword]
    );

    if (Array.isArray(rows) && rows.length > 0) {
      // Si el usuario quiere cambiar su username, primero verificamos si ya existe
    if (newUsername) {
      const [existingUser]: any = await pool.query(
        'SELECT * FROM mqtt_user WHERE username = ?',
        [newUsername]
      );

      if (Array.isArray(existingUser) && existingUser.length > 0) {
        res.status(400).json({ success: false, message: 'The new username is already in use' });
        return;
      }
    }

    if (newEmail) {
      const [existingUser]: any = await pool.query(
        'SELECT * FROM mqtt_user WHERE email = ?',
        [newEmail]
      );

      if (Array.isArray(existingUser) && existingUser.length > 0) {
        res.status(400).json({ success: false, message: 'Email is already in use, you can only have one account per email' });
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
      res.json({ success: true, message: 'User updated correctly. Login required.' });
    } else {
      res.status(404).json({ success: false, message: 'User Not Found' });
    }
    } else {
      res.status(401).json({ success: false, message: 'Incorrect credentials' });
      return;
    }
    //--
    

  } catch (error) {
    console.error('❌ Error al actualizar usuario:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

export default router;
