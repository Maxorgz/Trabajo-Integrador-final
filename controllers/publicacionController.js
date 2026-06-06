import { Publicacion, Imagen, Usuario, Etiquetas, Valoracion, Comentarios, Denuncia } from '../models/index.js';

export const mostrarInicio = async (req, res) => {
    try {
        const categoriaSeleccionada = req.query.categoria;

        let opcionesDeBusqueda = {
            include: [
                { model: Imagen, as: 'imagenes',
                    where: req.session.usuario ? {} : { licencia: 'sin_copyright'},
                    required: !req.session.usuario ? true : false },
                { model: Usuario, as: 'Usuario', attributes: ['nombre_usuario'] }
            ]
        };

        if (categoriaSeleccionada) {
            opcionesDeBusqueda.include.push({
                model: Etiquetas,
                as: 'etiquetas', 
                where: { nombre: categoriaSeleccionada } 
            });
        } else {
            opcionesDeBusqueda.include.push({
                model: Etiquetas,
                as: 'etiquetas'
            });
        }

        const publicaciones = await Publicacion.findAll(opcionesDeBusqueda);
        const fotosPlanas = publicaciones.map(foto => foto.toJSON());

        res.render('index', { 
            usuario: req.session.usuario,
            fotos: fotosPlanas,
            categoriaActiva: categoriaSeleccionada,
        });
    } catch (error) {
        console.error("Error al obtener publicaciones:", error);
        res.render('index', {
            usuario: req.session.usuario,
            fotos: [],
            mensajeAlerta: { status: 'error', text: 'Error al cargar las publicaciones' }
        });
    }
};

export const mostrarDetalleFoto = async (req, res) => {
    try {
        const { id } = req.params;
        const foto = await Publicacion.findByPk(id, {
            include: [
                { 
                    model: Imagen, 
                    as: 'imagenes',
                    where: req.session.usuario ? {} : { licencia: 'sin_copyright' },
                    required: false
                },
                {
                    model: Usuario, 
                    as: 'Usuario', 
                    attributes: ['nombre_usuario'] 
                },
                {
                    model: Valoracion,
                    as: 'valoraciones'
                },
                {
                    model: Comentarios,
                    as: 'comentarios',
                    include: [{ model: Usuario, as: 'Usuario', attributes: ['nombre_usuario'] }]
                },
                {
                    model: Etiquetas,
                    as: 'etiquetas'
                }
            ],
            order: [
                [{ model: Comentarios, as: 'comentarios' }, 'createdAt', 'DESC']
            ]
        });

        if (!foto) {
            return res.render('index', {
                usuario: req.session.usuario,
                fotos: [], 
                mensajeAlerta: { status: 'error', text: 'Foto no encontrada' }
            });
        }


        let totalLikes = 0;
        let promedio = 0;
        let totalVotosPuntaje = 0;
        
        if (foto.valoraciones && foto.valoraciones.length > 0) {
            const likes = foto.valoraciones.filter(v => v.me_gusta === true);
            totalLikes = likes.length;

            const puntajes = foto.valoraciones.filter(v => v.puntaje !== null);
            if (puntajes.length > 0) {
                totalVotosPuntaje = puntajes.length;
                const suma = puntajes.reduce((acc, voto) => acc + voto.puntaje, 0);
                promedio = (suma / totalVotosPuntaje).toFixed(1);
            }
        }

        res.render('detalleFoto', { 
            usuario: req.session.usuario,
            foto: foto,
            totalLikes,
            promedio,
            totalVotosPuntaje
        });
    } catch (error) {
        console.error(error);
        return res.render('index', {
            usuario: req.session.usuario,
            fotos: [],
            mensajeAlerta: { status: 'error', text: 'Ocurrió un error al cargar la foto' }
        });
    }
};

export const mostrarFormularioNuevo = async (req,res)=>{
    try{
        const etiquetasDisponibles = await Etiquetas.findAll();

        res.render('nuevaFoto', {
            usuario: req.session.usuario,
            etiquetas: etiquetasDisponibles
        });
    } catch (error) {
        console.error(error);
        res.render('nuevaFoto', {
            usuario: req.session.usuario,
            etiquetas: [],
            mensajeAlerta: { status: 'error', text: 'Ocurrio un error al cargar el formulario' }
        });
    }
};

export const crearPublicacion = async (req,res)=>{
    try{
        const { titulo, descripcion, tiene_copyright, imagenes_base64, etiquetas, nuevas_etiquetas } = req.body;
        const usuarioId = req.session.usuario.id;

        if (!titulo || titulo.trim() === '') {
            const todasLasEtiquetas = await Etiquetas.findAll(); 
            return res.render('nuevaFoto', { 
                etiquetas: todasLasEtiquetas,
                mensajeAlerta: { status: 'error', text: 'El titulo es obligatorio' } 
            });
        }

        if (!imagenes_base64 || imagenes_base64.length === 0) {
            const todasLasEtiquetas = await Etiquetas.findAll();
            return res.render('nuevaFoto', { 
                etiquetas: todasLasEtiquetas,
                mensajeAlerta: { status: 'error', text: 'Debes subir al menos una imagen valida' } 
            });
        }


        const nuevaPublicacion = await Publicacion.create({
            usuario_id: usuarioId,
            titulo: titulo,
            descripcion: descripcion,
            estado: 'activa'
        });

        const arrayImagenes = Array.isArray(imagenes_base64) ? imagenes_base64 : [imagenes_base64];

        const aplicarMarca = tiene_copyright === 'si' ? 'watermark_logo.png' : null;

        for (const base64Texto of arrayImagenes) {
            await Imagen.create({
                publicacion_id: nuevaPublicacion.id,
                url_imagen: base64Texto,
                licencia: tiene_copyright === 'si' ? 'copyright' : 'sin_copyright',
                marca_agua: aplicarMarca
            });
        }

        let idsEtiquetasFinales = [];

        if (etiquetas) {
            const etiquetasArray = Array.isArray(etiquetas) ? etiquetas : [etiquetas];
            idsEtiquetasFinales = [...etiquetasArray];
        }

        if (nuevas_etiquetas && nuevas_etiquetas.trim() !== '') {
            const arrayNuevas = nuevas_etiquetas.split(',').map(tag => tag.trim());
            
            for (const nombreTag of arrayNuevas) {
                if (nombreTag !== '') {
                    const [etiquetaDB, created] = await Etiquetas.findOrCreate({
                        where: { nombre: nombreTag }
                    });
                    idsEtiquetasFinales.push(etiquetaDB.id);
                }
            }
        }

        if (idsEtiquetasFinales.length > 0) {
            await nuevaPublicacion.addEtiquetas(idsEtiquetasFinales);
        }

        res.redirect('./');

    } catch (error) {
        console.error("Error al crear la publicacion", error);
        try{
            const todasLasEtiquetas = await Etiquetas.findAll();
            res.render('nuevaFoto', {
                etiquetas: todasLasEtiquetas,
                mensajeAlerta: { 
                status: 'error',
                text: 'Hubo un error al guardar la foto, intente nuevamente'}
            });         
        } catch (e) {
            res.redirect('/');
        }
    }
};

export const darMeGusta = async (req, res) => {
    try {
        const { id_publicacion } = req.params;
        const usuarioId = req.session.usuario.id;

        const [voto, created] = await Valoracion.findOrCreate({
            where: { usuario_id: usuarioId, publicacion_id: id_publicacion },
            defaults: { me_gusta: true }
        });

        if (!created) {
            await voto.update({ me_gusta: !voto.me_gusta });
        }

        res.redirect(req.get('referer') || '/');
    } catch (error) {
        console.error("Error en el Me gusta:", error);
        res.redirect('/');
    }
};

export const valorarPublicacion = async (req, res) => {
    try {
        const { id_publicacion } = req.params;
        const { puntaje } = req.body;
        const usuarioId = req.session.usuario.id;

        const [voto, created] = await Valoracion.findOrCreate({
            where: { usuario_id: usuarioId, publicacion_id: id_publicacion },
            defaults: { puntaje: parseInt(puntaje) }
        });

        if (!created) {
            await voto.update({ puntaje: parseInt(puntaje) });
        }

        res.redirect(req.get('referer') || '/');
    } catch (error) {
        console.error("Error en la valoracion:", error);
        res.redirect('/');
    }
};

export const agregarComentario = async (req, res) => {
    try {
        const { id_publicacion } = req.params;
        const { texto } = req.body;
        const usuarioId = req.session.usuario.id;

        if (texto && texto.trim() !== '') {
            await Comentarios.create({
                publicacion_id: id_publicacion,
                usuario_id: usuarioId,
                texto: texto
            });
        }

        res.redirect(req.get('referer') || '/');
    } catch (error) {
        console.error("Error al comentar:", error);
        res.redirect('/');
    }
};

export const denunciarPublicacion = async (req, res) => {
    try {
        const { id_publicacion } = req.params;
        const { motivo } = req.body;
        const usuarioId = req.session.usuario.id;

        const denunciaPrevia = await Denuncia.findOne({
            where: {
                publicacion_id: id_publicacion,
                usuario_denunciante_id: usuarioId
            }
        });

        if (!denunciaPrevia) {
            await Denuncia.create({
                publicacion_id: id_publicacion,
                usuario_denunciante_id: usuarioId,
                motivo: motivo
            });
        }

        res.redirect(req.get('referer') || '/');
    } catch (error) {
        console.error("Error al denunciar:", error);
        res.redirect('/');
    }
};