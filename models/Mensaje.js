import sequelize from '../models/config.js';
import { Model, DataTypes } from 'sequelize';

export class Mensaje extends Model {}

Mensaje.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    emisor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    receptor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    },

    texto: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    fecha_envio: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
   
  },
  {
    sequelize, 
    modelName: 'mensajes',
    timestamps:'false',
  },
);