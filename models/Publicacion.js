import sequelize from '../config/db.js';
import { Model, DataTypes } from 'sequelize';

export class Publicacion extends Model {}

Publicacion.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    titulo: {
    type: DataTypes.STRING,
    allowNull: false,
    },

    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    estado: {
      type: DataTypes.STRING(30),
      defaultValue: 'activa',
    },
   
    comentarios_abiertos: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }

  },
  {
    sequelize, 
    modelName: 'publicaciones',
    timestamps:'false',
  },
);
export default Publicacion;