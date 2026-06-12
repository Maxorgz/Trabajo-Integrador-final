import sequelize from '../config/db.js';

import Usuario from './Usuario.js';
import Publicacion from './Publicacion.js';
import Imagen from './Imagen.js';
import Comentarios from './Comentarios.js';
import Valoracion from './Valoracion.js';
import Etiqueta from './Etiqueta.js';
import Mensaje from './Mensaje.js';
import Seguidor from './Seguidor.js';

// Usuario 1-N Publicacion 
Usuario.hasMany(Publicacion, { foreignKey: 'usuario_id', onDelete: 'CASCADE' });
Publicacion.belongsTo(Usuario, { foreignKey: 'usuario_id' });

// Publicacion 1-N Imagen
Publicacion.hasMany(Imagen, { as: 'imagenes', foreignKey: 'publicacion_id', onDelete: 'CASCADE' });
Imagen.belongsTo(Publicacion, { foreignKey: 'publicacion_id' });

// Publicacion 1-N Comentario
Publicacion.hasMany(Comentarios, { as: 'comentarios', foreignKey: 'publicacion_id', onDelete: 'CASCADE' });
Comentarios.belongsTo(Publicacion, { foreignKey: 'publicacion_id' });

// Usuario 1...N Comentario
Usuario.hasMany(Comentarios, { as: 'comentarios', foreignKey: 'usuario_id', onDelete: 'CASCADE' });
Comentarios.belongsTo(Usuario, { as: 'Usuario', foreignKey: 'usuario_id' });

// Imagen 1...N Valoracion
Publicacion.hasMany(Valoracion, { as: 'valoraciones', foreignKey: 'publicacion_id', onDelete: 'CASCADE' });
Valoracion.belongsTo(Publicacion, { foreignKey: 'publicacion_id' });

// Usuario 1...N Valoracion
Usuario.hasMany(Valoracion, { foreignKey: 'usuario_id', onDelete: 'CASCADE' });
Valoracion.belongsTo(Usuario, { foreignKey: 'usuario_id' });

// Publicacion N-M Etiqueta
Publicacion.belongsToMany(Etiqueta, { 
    as: 'etiquetas',
    through: 'publicacion_etiquetas', 
    foreignKey: 'publicacion_id',
    timestamps: false 
});
Etiqueta.belongsToMany(Publicacion, { 
    as: 'publicaciones',
    through: 'publicacion_etiquetas', 
    foreignKey: 'etiqueta_id',
    timestamps: false 
});

// Usuario N-M Usuario
Usuario.belongsToMany(Usuario, { 
    as: 'Seguidores', 
    through: Seguidor, 
    foreignKey: 'usuario_seguido_id', 
    otherKey: 'usuario_seguidor_id' 
});
Usuario.belongsToMany(Usuario, { 
    as: 'Seguidos', 
    through: Seguidor, 
    foreignKey: 'usuario_seguidor_id', 
    otherKey: 'usuario_seguido_id' 
});

export {
    sequelize,
    Usuario,
    Publicacion,
    Imagen,
    Comentarios,
    Valoracion,
    Etiqueta,
    Mensaje,
    Seguidor,
};