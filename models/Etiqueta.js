import sequelize from '../config/db.js';
import { Model, DataTypes } from 'sequelize';


export class Etiqueta extends Model {}

Etiqueta.init(
  {
    
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
  },
  {
    
    sequelize, 
    modelName: 'etiqueta',
    tableName: 'etiquetas',
    timestamps:'true',
    
  },
);
export default Etiqueta;