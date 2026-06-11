import 'dotenv/config';
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
    process.env.DB_NAME, 
    process.env.DB_USER,
    String(process.env.DB_PASSWORD),
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'postgres',
        timezone: '-03:00',
        logging: false,
    }
);

sequelize.authenticate()
    .then(() => {
        console.log('Conexion con exito con la base de datos');
    })
    .catch(err => {
        console.error('No se pudo conectar a la base de datos', err);
    });

export default sequelize;