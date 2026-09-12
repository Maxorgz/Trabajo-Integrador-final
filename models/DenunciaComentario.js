import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const DenunciaComentario = sequelize.define('DenunciaComentario', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    motivo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    justificacion: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {
    tableName: 'denuncias_comentarios',
    timestamps: true
});

export default DenunciaComentario;