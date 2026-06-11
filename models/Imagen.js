import sequelize from '../config/db.js';
import { Model, DataTypes } from 'sequelize';

export class Imagen extends Model {}

Imagen.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },


    publicacion_id: {
      type: DataTypes.INTEGER,
      allowNull: false,  
    },

    url_imagen: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
   
    licencia: {
      type: DataTypes.STRING(50),
        defaultValue: 'sin_copyright',
    },

    marca_agua: {
      type: DataTypes.STRING(100),
      defaultValue: true,
    },

  },
  {
    sequelize, 
    modelName: 'imagenes',
    timestamps:'true',
  },
);

export default Imagen;