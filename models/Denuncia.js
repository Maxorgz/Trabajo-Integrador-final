import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Denuncia = sequelize.define('Denuncia', {
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
    },
    estado: {
        type: DataTypes.STRING,
        defaultValue: 'PENDIENTE'
    }
}, {
    tableName: 'denuncias',
    timestamps: true
});

export default Denuncia;