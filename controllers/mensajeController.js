import Mensaje from '../models/Mensaje.js';
import Publicacion from '../models/Publicacion.js';
import Usuario from '../models/Usuario.js';
import Notificacion from '../models/Notificacion.js';
import Imagen from '../models/Imagen.js';
import { Op } from 'sequelize';

export const meInteresa = async (req, res) => {
    try {
        const id_publicacion = req.params.id; 
        const interesadoId = req.session.usuario.id;

        const publicacion = await Publicacion.findByPk(id_publicacion);
        
        if (!publicacion || publicacion.usuario_id === interesadoId) {
            return res.redirect('back');
        }

        const contactoPrevio = await Mensaje.findOne({
            where: {
                emisor_id: interesadoId,
                receptor_id: publicacion.usuario_id,
                publicacion_id: id_publicacion
            }
        });

        if (!contactoPrevio) {
            await Mensaje.create({
                emisor_id: interesadoId,
                receptor_id: publicacion.usuario_id,
                publicacion_id: id_publicacion,
                texto: `Hola, estoy interesado en tu publicación "${publicacion.titulo}".`
            });
            
            await Notificacion.create({
                usuario_id: publicacion.usuario_id,
                actor_id: interesadoId,
                tipo: 'ME_INTERESA',
                publicacion_id: id_publicacion,
                leida: false
            });
        }

        res.redirect('/mis-mensajes'); 
        
    } catch (error) {
        console.error("Error al enviar Me Interesa:", error);
        res.redirect('back');
    }
};

export const mostrarMensajes = async (req, res) => {
    try {
        const usuarioId = req.session.usuario.id;

        const mensajes = await Mensaje.findAll({
            where: {
                [Op.or]: [
                    { emisor_id: usuarioId },
                    { receptor_id: usuarioId }
                ]
            },
            include: [
                { model: Usuario, as: 'Emisor', attributes: ['id', 'nombre_usuario', 'apellido_usuario'] },
                { model: Usuario, as: 'Receptor', attributes: ['id', 'nombre_usuario', 'apellido_usuario'] },
                { 
                    model: Publicacion, 
                    as: 'PublicacionRelacionada', 
                    attributes: ['id', 'titulo'],
                    include: [{
                        model: Imagen,
                        as: 'imagenes' 
                    }] 
                }
            ],
            order: [['fecha_envio', 'ASC']]
        });

        const conversacionesMap = {};
        
        mensajes.forEach(msg => {
            const esMio = msg.emisor_id === usuarioId;
            const emisor = msg.Emisor || msg.emisor;
            const receptor = msg.Receptor || msg.receptor; 
            const otroUsuario = esMio ? receptor : emisor;
            
            if (!otroUsuario) {
                console.log(`Mensaje omitido: ID ${msg.id}`);
                return; 
            }

            const key = `${otroUsuario.id}-${msg.publicacion_id}`;
            
            if (!conversacionesMap[key]) {
                conversacionesMap[key] = {
                    otroUsuario: otroUsuario,
                    publicacion: msg.PublicacionRelacionada || msg.publicacionRelacionada,
                    mensajes: []
                };
            }
            conversacionesMap[key].mensajes.push(msg);
        });

        res.render('mensajes', {
            usuario: req.session.usuario,
            conversaciones: Object.values(conversacionesMap)
        });

    } catch (error) {
        console.error("Error al cargar mensajes:", error);
        res.redirect('/');
    }
};

export const responderMensaje = async (req, res) => {
    try {
        const { receptor_id, publicacion_id, texto } = req.body;
        const emisor_id = req.session.usuario.id;

        if (texto && texto.trim() !== '') {
            await Mensaje.create({
                emisor_id: emisor_id,
                receptor_id: receptor_id,
                publicacion_id: publicacion_id || null, 
                texto: texto
            });
            
            await Notificacion.create({
                usuario_id: receptor_id,
                actor_id: emisor_id,
                tipo: 'MENSAJE',
                publicacion_id: publicacion_id || null,
                leida: false
            });
        }
        res.redirect('/mis-mensajes');
    } catch (error) {
        console.error("Error al responder:", error);
        res.redirect('/mis-mensajes');
    }
};