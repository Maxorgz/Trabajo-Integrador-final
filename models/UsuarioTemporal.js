import sequelize from '../config/db.js';
import { Model, DataTypes } from 'sequelize';

export class Usuario extends Model {}

Usuario.init(
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

    apellido_usuario: {
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
    modelName: 'Usuario', 
    tableName: 'usuarios',
    timestamps: 'false',
    createdAt: 'true',
    deletedAt: 'true',
  },
);

export default Usuario;