import sequelize from '../models/config.js';
import { Model, DataTypes } from 'sequelize';

export class Comentarios extends Model {}

Comentarios.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },


    imagen_id: {
      type: DataTypes.INTEGER,
      allowNull: false,  
    },

    texto: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
   
  },
  {
    sequelize, 
    modelName: 'comentarios',
    timestamps:'false',
  },
);