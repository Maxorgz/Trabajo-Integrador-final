import sequelize from '../models/config.js';
import { Model, DataTypes } from 'sequelize';

export class Denuncia extends Model {}

Denuncia.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    tipo_denuncia: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    
    usuario_denunciante: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    motivo: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    estado: {
    type: DataTypes.STRING(20),
    defaultValue: 'pendente',
     },

  },
  {
    sequelize, 
    modelName: 'denuncias',
    timestamps:'false',
  },
);