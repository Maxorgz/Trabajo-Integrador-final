import sequelize from '../models/config.js';
import { Model, DataTypes } from 'sequelize';

export class Seguidores extends Model {}

Seguidores.init(
  {
    usuario_seguido_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },


    usuario_seguidor_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,  
    },

    fecha_seguimiento: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
   
  },
  {
    sequelize, 
    modelName: 'seguidores',
    timestamps:'false',
  },
);