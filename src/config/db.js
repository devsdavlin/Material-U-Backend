require('dotenv').config();
const { Pool } = require('pg');
//
const pool= new Pool({
    connectionString: process.env.Data_Url,
    ssl: {
        rejectUnauthorized: false
    }
});
const app = express();
//
const conexionDb = async () => {
    try {   
        if (!process.env.Data_Url) {
            throw new Error('La variable de entorno Data_Url no está definida.');
        }
        const Life= await pool.query('SELECT NOW()');
        console.log('Conexión a la base de datos establecida:', Life.rows[0]);
    }
    catch (error) {
        console.error('Error al conectar a la base de datos:', error);
        process.exit(1);
    }
}

conexionDb();
module.exports = pool;
