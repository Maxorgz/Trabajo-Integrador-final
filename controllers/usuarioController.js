import { Seguidor, Usuario, Publicacion, Notificacion } from '../models/index.js';

export const toggleSeguir = async (req, res) => {
    try {
        const usuario_a_seguir_id = parseInt(req.params.id);
        const mi_id = req.session.usuario.id;
        const paginaAnterior = req.get('referer') || '/';

        if (usuario_a_seguir_id === mi_id) {
            return res.redirect(paginaAnterior);
        }

        const relacionExistente = await Seguidor.findOne({
            where: {
                usuario_seguidor_id: mi_id,
                usuario_seguido_id: usuario_a_seguir_id
            }
        });

        if (relacionExistente) {
            await relacionExistente.destroy();
        } else {
            await Seguidor.create({
                usuario_seguidor_id: mi_id,
                usuario_seguido_id: usuario_a_seguir_id
            });
            
            await Notificacion.create({
                usuario_id: usuario_a_seguir_id, 
                actor_id: mi_id,                 
                tipo: 'SEGUIDOR',              
                publicacion_id: null
            });
        }

        res.redirect(paginaAnterior);
    } catch (error) {
        console.error("Error al seguir usuario:", error);
        res.redirect('/');
    }
};

export const verNotificaciones = async (req, res) => {
    try {
        const usuarioId = req.session.usuario.id;

        const notificaciones = await Notificacion.findAll({
            where: { usuario_id: usuarioId },
            include: [
                { model: Usuario, as: 'Actor', attributes: ['nombre_usuario'] },
                { model: Publicacion, attributes: ['id', 'titulo'] }
            ],
            order: [['createdAt', 'DESC']] 
        });

        res.render('notificaciones', {
            usuario: req.session.usuario,
            notificaciones: notificaciones
        });

    } catch (error) {
        console.error("Error al cargar las notificaciones:", error);
        res.redirect('/');
    }
};

export const marcarNotificacionLeida = async (req, res) => {
    try {
        const { id } = req.params;
        const usuarioId = req.session.usuario.id;

        await Notificacion.update(
            { leida: true },
            { where: { id: id, usuario_id: usuarioId } }
        );

        res.redirect('/notificaciones');
    } catch (error) {
        console.error("Error al marcar como leida:", error);
        res.redirect('/notificaciones');
    }
};