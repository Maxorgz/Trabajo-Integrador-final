import sequelize from '../config/db.js'; 
import { sembrarDatos } from './seed.js';

const inicializarBaseDeDatos = async () => {
    try {
        console.log("Conectando y sincronizando base de datos");
        await sequelize.sync({ force: true }); 
        console.log("Tablas creadas desde cero.");

        await sembrarDatos();

        console.log("Base de datos completada");
        process.exit(0);
    } catch (error) {
        console.error("Error en el proceso", error);
        process.exit(1);
    }
};

inicializarBaseDeDatos();