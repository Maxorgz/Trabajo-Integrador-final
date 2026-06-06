import sequelize from '../models/config.js';
import { DataTypes } from "sequelize";

export class Rating extends Model {}
Rating.init(
    {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    imagen_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    usuario_id: {
        type: DataTypes.INTEGER,
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
    tableName: 'valoraciones',
    timestamps: false
 }
);