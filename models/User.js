import sequelize from '../models/config.js';
import { Model, DataTypes } from 'sequelize';

export class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    nombre_usuario: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },

    lastName: {
      type: DataTypes.STRING(50),
      
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },

    password: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    rol: {
    type: DataTypes.STRING(20),
    defaultValue: 'usuario'
    },

    estado: {
    type: DataTypes.STRING(20),
    defaultValue: 'activo'
    }

  },
  {
    
    sequelize, 
    modelName: 'usuario',
    timestamps: 'false',
    createdAt: 'true',
    deletedAt: 'true',
  },
);