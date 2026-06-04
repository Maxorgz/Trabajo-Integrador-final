import sequelize from '../models/config.js';
import { Model, DataTypes } from 'sequelize';

export class User extends Model {}

User.init(
  {
    
    firstName: {
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
    }
  },
  {
    
    sequelize, 
    modelName: 'User',
    createdAt: 'true',
    deletedAt: 'true',
  },
);