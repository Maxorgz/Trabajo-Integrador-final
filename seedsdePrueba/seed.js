import sequelize from './config/db.js'; 
import { Usuario, Etiqueta } from './models/index.js'; 

const ejecutarSeed = async () => {
    try { 
        console.log(" Sincronizando base de datos");
        await sequelize.sync({ force: true }); 

        console.log("👥 Creando usuarios...");
        await Usuario.bulkCreate([
            { 
                nombre_usuario: 'admin', 
                apellido_usuario: 'Sistema',
                email: 'admin@test.com', 
                password: '123456', 
                rol: 'validador', 
                estado: 'activo' 
            },
            { 
                nombre_usuario: 'Flor', 
                apellido_usuario: 'Gomez',
                email: 'flor@test.com', 
                password: '123456', 
                rol: 'usuario', 
                estado: 'activo' 
            },
            { 
                nombre_usuario: 'Gustavo', 
                apellido_usuario: 'Perez',
                email: 'gustavo@test.com', 
                password: '123456', 
                rol: 'usuario', 
                estado: 'activo' 
            },
            { 
                nombre_usuario: 'Maxo', 
                apellido_usuario: 'Lopez',
                email: 'maxo@test.com', 
                password: '123456', 
                rol: 'usuario', 
                estado: 'activo' 
            },
            { 
                nombre_usuario: 'lucas', 
                apellido_usuario: 'Diaz',
                email: 'lucas@test.com', 
                password: '123456', 
                rol: 'usuario', 
                estado: 'activo' 
            }
        ]);

        console.log("Creando etiquetas");
        await Etiqueta.bulkCreate([
            { nombre: 'Naturaleza' },
            { nombre: 'Comida' },
            { nombre: 'Retro' },
            { nombre: 'Moda' }
        ]);

        console.log("Base de datos lista");
        process.exit(0); 

    } catch (error) {
        console.error(" Error de seed:", error);
        process.exit(1); 
    }
};