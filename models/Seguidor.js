import sequelize from '../config/db.js';
import { Model, DataTypes } from 'sequelize';

export class Seguidor extends Model {}

Seguidor.init(
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
export default Seguidor;