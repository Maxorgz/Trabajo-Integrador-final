import sequelize from '../models/config.js';
import { Model, DataTypes } from 'sequelize';

export class Coleccion extends Model {}

Coleccion.init(
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

    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
   
  },
  {
    sequelize, 
    modelName: 'colecciones',
    timestamps:'true',
  },
);