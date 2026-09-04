import { Coleccion, Publicacion, Imagen, Usuario } from '../models/index.js'; 

export const misColecciones = async (req, res) => {
    try {
        const usuarioId = req.session.usuario.id;

        const colecciones = await Coleccion.findAll({
            where: { usuario_id: usuarioId },
            include: [{ 
                model: Publicacion, 
                as: 'publicaciones', 
                attributes: ['id']
            }]
        });

        res.render('colecciones', {
            usuario: req.session.usuario,
            colecciones: colecciones
        });
    } catch (error) {
        console.error("Error al cargar colecciones:", error);
        res.redirect('/');
    }
};

export const crearColeccion = async (req, res) => {
    try {
        const usuarioId = req.session.usuario.id;
        const { nombre } = req.body;

        if (nombre && nombre.trim() !== '') {
            await Coleccion.create({
                usuario_id: usuarioId,
                nombre: nombre.trim()
            });
        }
        res.redirect('/colecciones');
    } catch (error) {
        console.error("Error al crear colección:", error);
        res.redirect('/colecciones');
    }
};

export const guardarEnColeccion = async (req, res) => {
    try {
        const { coleccion_id, publicacion_id } = req.body;

        const coleccion = await Coleccion.findOne({
            where: { id: coleccion_id, usuario_id: req.session.usuario.id }
        });
        const publicacion = await Publicacion.findByPk(publicacion_id);

        if (coleccion && publicacion) {
            const yaEstaGuardada = await coleccion.hasPublicacion(publicacion);
            if (!yaEstaGuardada) {
                await coleccion.addPublicacion(publicacion);
            }  
        }

        res.redirect(req.get('referer') || '/');
    } catch (error) {
        console.error("Error al guardar en coleccion:", error);
        res.redirect('/');
    }
};

export const verColeccion = async (req, res) => {
    try {
        const { id } = req.params;
        const usuarioId = req.session.usuario.id;

        const coleccion = await Coleccion.findOne({
            where: { id: id, usuario_id: usuarioId },
            include: [{
                model: Publicacion,
                as: 'publicaciones', 
                include: [
                    { model: Imagen, as: 'imagenes' },
                    { model: Usuario, as: 'Usuario', attributes: ['nombre_usuario'] }
                ]
            }]
        });

        if (!coleccion) {
            return res.redirect('/colecciones');
        }

        res.render('detalleColeccion', {
            usuario: req.session.usuario,
            coleccion: coleccion
        });

    } catch (error) {
        console.error("Error al cargar la colección:", error);
        res.redirect('/colecciones');
    }
};

export const quitarDeColeccion = async (req, res) => {
    const { idColeccion, idPublicacion } = req.body;
    const coleccion = await Coleccion.findByPk(idColeccion);
    const publicacion = await Publicacion.findByPk(idPublicacion);
    
    if(coleccion && publicacion){
        await coleccion.removePublicacion(publicacion);
    }
    res.redirect('back');
}