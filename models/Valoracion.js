import sequelize from '../config/db.js';
import { Model, DataTypes } from 'sequelize';

export class Valoracion extends Model {}
Valoracion.init(
    {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    publicacion_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    me_gusta: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    puntaje: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5
        }
        
    }
 }, {
    sequelize,
    tableName: 'valoraciones',
    timestamps: false,
    defaultValue: false
 }
);
export default Valoracion;