import { Notificacion, Usuario } from '../models/index.js';

export const cargarNotificacionesGlobales = async (req, res, next) => {
    if (req.session && req.session.usuario) {
        try {
            const notificaciones = await Notificacion.findAll({
                where: { usuario_id: req.session.usuario.id, leida: false },
                include: [{ model: Usuario, as: 'Actor', attributes: ['nombre_usuario', 'apellido_usuario'] }],
                order: [['createdAt', 'DESC']],
                limit: 5
            });

            res.locals.notificacionesGlobales = notificaciones;
        } catch (error) {
            console.error("Error cargando notificaciones globales:", error);
            res.locals.notificacionesGlobales = [];
        }
    } else {
        res.locals.notificacionesGlobales = [];
    }
    next();
};