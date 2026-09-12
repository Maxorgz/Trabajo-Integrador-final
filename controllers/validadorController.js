import { Publicacion, Denuncia, Usuario, Imagen } from '../models/index.js';
import { Op } from 'sequelize';

export const mostrarPanel = async (req, res) => {
    try {
        const validadorId = req.session.usuario.id;
        
        const publicaciones = await Publicacion.findAll({
            where: { 
                usuario_id: { [Op.ne]: validadorId },
                estado: 'activa'
            },
            include: [
                { model: Imagen, as: 'imagenes' },
                { model: Usuario, attributes: ['nombre_usuario', 'apellido_usuario'] },
                { 
                    model: Denuncia, 
                    as: 'denuncias',
                    where: { estado: 'pendiente' },
                    include: [{ model: Usuario, as: 'Denunciante', attributes: ['nombre_usuario', 'apellido_usuario'] }]
                }
            ]
        });

        //filtro 3 denuncias
        const enPeligro = publicaciones.filter(pub => pub.denuncias.length >= 3);
        
        // filtro 2 o 1 denuncia
        const enRevision = publicaciones.filter(pub => pub.denuncias.length > 0 && pub.denuncias.length < 3);

        res.render('panelValidador', {
            usuario: req.session.usuario,
            enPeligro: enPeligro,
            enRevision: enRevision
        });
    } catch (error) {
        console.error("Error en el panel:", error);
        res.redirect('/');
    }
};

export const rechazarDenuncias = async (req, res) => {
    try {
        const { id_publicacion } = req.params;
        const validadorId = req.session.usuario.id;
        
        const publicacion = await Publicacion.findByPk(id_publicacion);
        if (!publicacion || publicacion.usuario_id === validadorId) {
            return res.redirect('/validador/panel');
        }

        // desestimar
        await Denuncia.update(
            { estado: 'desestimada' },
            { where: { publicacion_id: id_publicacion, estado: 'pendiente' } }
        );
        
        res.redirect('/validador/panel');
    } catch (error) {
        console.error(error);
        res.redirect('/validador/panel');
    }
};

export const darDeBaja = async (req, res) => {
    try {
        const { id_publicacion } = req.params;
        const validadorId = req.session.usuario.id;

        const publicacion = await Publicacion.findByPk(id_publicacion);
        if (!publicacion || publicacion.usuario_id === validadorId) {
            return res.redirect('/validador/panel');
        }

        await publicacion.update({ estado: 'inactiva' });
        
        // historial de denuncias
        await Denuncia.update(
            { estado: 'aceptada' },
            { where: { publicacion_id: id_publicacion } }
        );

        // fotos inactivas
        const cantidadBajadas = await Publicacion.count({
            where: { usuario_id: publicacion.usuario_id, estado: 'inactiva' }
        });

        // 3 fotos usuario inactivo
        if (cantidadBajadas >= 3) {
            await Usuario.update(
                { estado: 'inactivo' },
                { where: { id: publicacion.usuario_id } }
            );
        }

        res.redirect('/validador/panel');
    } catch (error) {
        console.error(error);
        res.redirect('/validador/panel');
    }
};