import sequelize from '../models/config.js';
import { Model, DataTypes } from 'sequelize';


export class Tag extends Model {}

Tag.init(
  {
    
    id: {
      type: DataTypes.INTIGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
  },
  {
    
    sequelize, 
    modelName: 'Tag',
    tableName: 'tags',
    timestamps:'true',
    
  },
);