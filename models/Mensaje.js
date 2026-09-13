import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Mensaje = sequelize.define('Mensaje', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    emisor_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    receptor_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    publicacion_id: {
        type: DataTypes.INTEGER,
        allowNull: true 
    },
    texto: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    fecha_envio: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'mensajes',
    timestamps: false
});

export default Mensaje;