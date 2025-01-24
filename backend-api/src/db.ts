import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
//import dotenv from 'dotenv';


import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });


//dotenv.config();
if (!process.env.DB_HOST) { 
  console.error('❌ No se encontraron las variables de entorno.');
} else { 
  console.log('🔍 Variables de entorno cargadas:', { DB_HOST: process.env.DB_HOST, DB_USER: process.env.DB_USER, DB_PASSWORD: process.env.DB_PASSWORD, DB_NAME: process.env.DB_NAME, DB_PORT: process.env.DB_PORT });
}
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});



(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conectado a la base de datos');
    connection.release(); // Liberar la conexión después de probar
  } catch (err) {
    console.error('❌ Error de conexión a la base de datos:', err);
  }
})();
export default pool;