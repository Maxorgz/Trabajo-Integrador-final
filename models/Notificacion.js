import sequelize from '../models/config.js';
import { Model, DataTypes } from 'sequelize';

export class Notificacion extends Model {}

Mensaje.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    usuario_emisor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    usuario_receptor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    },

    tipo_evento: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },

    leido: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
   
  },
  {
    sequelize, 
    modelName: 'notificacion',
    timestamps:'false',
  },
);