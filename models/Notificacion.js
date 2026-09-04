import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

export class Notificacion extends Model {}

Notificacion.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    usuario_id: { type: DataTypes.INTEGER, allowNull: false },
    actor_id: { type: DataTypes.INTEGER, allowNull: false },   
    tipo: { type: DataTypes.STRING, allowNull: false },        
    publicacion_id: { type: DataTypes.INTEGER, allowNull: true }, 
    leida: { type: DataTypes.BOOLEAN, defaultValue: false }   
  },
  {
    sequelize,
    modelName: 'notificaciones',
    timestamps: true,
  }
);