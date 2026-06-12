import { Publicacion, Imagen, Usuario, Etiqueta, Valoracion, Comentarios} from '../models/index.js';

export const mostrarInicio = async (req, res) => {
    try {
        const fotosEncontradas = await Publicacion.findAll({
            include: [
                { model: Imagen, as: 'imagenes' }, 
                { model: Usuario },
                { model: Etiqueta, as: 'etiquetas' }
            ],
            order: [['createdAt', 'DESC']]
        });

        const etiquetas = await Etiqueta.findAll();

        res.render('index', {
            // ❌ No pasamos el usuario manualmente, tu middleware del index.js ya lo hace
            fotos: fotosEncontradas,
            filtrosActuales: {}, 
            etiquetasSidebar: etiquetas 
        });
        
    } catch (error) {
        console.error("Error cargando la galería:", error);
        res.render('index', { 
            fotos: [], 
            filtrosActuales: {}, 
            etiquetasSidebar: [] 
        });
    }
};

export const mostrarDetalleFoto = async (req, res) => {
    try {
        const idFoto = req.params.id;
        
        if (isNaN(idFoto)) {
            return res.status(404).send('Ruta no válida');
        }

        
        const fotoEncontrada = await Publicacion.findByPk(idFoto, {
            include: [
                { model: Usuario }, 
                { model: Imagen, as: 'imagenes' },
                { model: Etiqueta, as: 'etiquetas' },
                
                // Agregamos las relaciones
                { model: Valoracion, as: 'valoraciones' },
                { 
                    model: Comentarios, 
                     as: 'comentarios',
                     include: [{ model: Usuario, as: 'Usuario', attributes: ['nombre_usuario'] }]
                }
            ],
            order: [
                [{ model: Comentarios, as: 'comentarios' }, 'createdAt', 'DESC']
            ]
        });

        if (!fotoEncontrada) {
            return res.status(404).send('Foto no encontrada');
        }

        // 🧮 MATEMÁTICA: Calculamos likes y promedios solo si existen
        let totalLikes = 0;
        let promedio = 0;
        let totalVotosPuntaje = 0;
        
        if (fotoEncontrada.valoraciones && fotoEncontrada.valoraciones.length > 0) {
            const likes = fotoEncontrada.valoraciones.filter(v => v.me_gusta === true);
            totalLikes = likes.length;

            const puntajes = fotoEncontrada.valoraciones.filter(v => v.puntaje !== null);
            if (puntajes.length > 0) {
                totalVotosPuntaje = puntajes.length;
                const suma = puntajes.reduce((acc, voto) => acc + voto.puntaje, 0);
                promedio = (suma / totalVotosPuntaje).toFixed(1);
            }
        }

        res.render('DetalleFoto', { 
            usuario: req.session.usuario,
            foto: fotoEncontrada,
            totalLikes,
            promedio,
            totalVotosPuntaje
        });

    } catch (error) {
        console.error("Error al cargar el detalle de la foto:", error);
        res.status(500).send('Error al cargar la publicación');
    }
};

export const mostrarFormularioNuevo = async (req,res)=>{
    try{
        const etiquetasDisponibles = await Etiqueta.findAll();

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
            const todasLasEtiquetas = await Etiqueta.findAll(); 
            return res.render('nuevaFoto', { 
                etiquetas: todasLasEtiquetas,
                mensajeAlerta: { status: 'error', text: 'El titulo es obligatorio' } 
            });
        }

        if (!imagenes_base64 || imagenes_base64.length === 0) {
            const todasLasEtiquetas = await Etiqueta.findAll();
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
                    const [etiquetaDB, created] = await Etiqueta.findOrCreate({
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
            const todasLasEtiquetas = await Etiqueta.findAll();
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
    const id_publicacion = req.params.id_publicacion; 

    try {
        const usuarioId = req.session.usuario.id;
        const foto = await Publicacion.findByPk(id_publicacion);

        if (!foto || foto.usuario_id === usuarioId) {
            return res.redirect(`/foto/${id_publicacion}`);
        }

        const [voto, created] = await Valoracion.findOrCreate({
            where: { usuario_id: usuarioId, publicacion_id: id_publicacion },
            defaults: { 
                me_gusta: true,
                puntaje: 5 
            }
        });

        if (!created) {
            await voto.update({ me_gusta: !voto.me_gusta });
        }


        req.session.save(() => {
            return res.redirect(`/foto/${id_publicacion}`);
        });

    } catch (error) {
        console.error("Error en el Me gusta:", error);
        res.redirect(id_publicacion ? `/foto/${id_publicacion}` : '/'); 
    }
};

export const agregarComentario = async (req, res) => {
    try {
        const { id_publicacion } = req.params;
        const { texto } = req.body;
        const usuarioId = req.session.usuario.id;

        if (texto && texto.trim() !== '') {
            await Comentarios.create({
                imagen_id: id_publicacion,
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

export const eliminarComentario = async (req, res) => {
    try {
        const { id_comentario } = req.params;
        const usuarioId = req.session.usuario.id;
        
        const comentario = await Comentarios.findByPk(id_comentario);

        if (comentario) {
            const fotoId = comentario.publicacion_id;
            
            // validar usuario 
            if (comentario.usuario_id === usuarioId) {
                await comentario.destroy(); 
            }
            
            return req.session.save((err) => {
                if (err) {
                    console.error("Error al guardar la sesión:", err);
                }
                res.redirect(`/foto/${fotoId}`);
            });
        }

        req.session.save(() => {
            res.redirect('/');
        });
        
    } catch (error) {
        console.log("Error al borrar comentario:", error);
        res.status(500).send("Error al borrar comentario");
    }
};

export const mostrarPerfil = async (req, res) => {
    try {
        const { id } = req.params;
        const perfilUsuario = await Usuario.findByPk(id);

        if (!perfilUsuario) {
            return res.redirect('/'); 
        }

        const publicaciones = await Publicacion.findAll({
            where: { usuario_id: id },
            include: [
                { model: Imagen, as: 'imagenes' },
                { model: Etiqueta, as: 'etiquetas' }
            ],
            order: [['createdAt', 'DESC']]
        });

        const fotosPlanas = publicaciones.map(foto => foto.toJSON());

        res.render('perfil', {
            usuario: req.session.usuario, 
            dueñoPerfil: perfilUsuario,   
            fotos: fotosPlanas,          
            cantSeguidores: 0,
            cantSeguidos: 0
        });

    } catch (error) {
        console.error("Error al cargar el perfil:", error);
        res.redirect('/');
    }
};


export const mostrarFeedSeguidos = async (req, res) => {
    try {
        const mi_id = req.session.usuario.id;

        const seguidos = await Seguidor.findAll({
            where: { usuario_seguidor_id: mi_id },
            attributes: ['usuario_seguido_id']
        });

        const idsSeguidos = seguidos.map(s => s.usuario_seguido_id);

        if (idsSeguidos.length === 0) {
            return res.render('feedSeguidos', {
                usuario: req.session.usuario,
                fotos: []
            });
        }

        const publicacionesFeed = await Publicacion.findAll({
            where: {
                usuario_id: { [Op.in]: idsSeguidos },
                estado: 'activa'
            },
            include: [
                { model: Imagen, as: 'imagenes' },
                { model: Usuario, as: 'Usuario', attributes: ['nombre_usuario'] }
            ],
            order: [['fecha_publicacion', 'DESC']] 
        });

        res.render('feedSeguidos', {
            usuario: req.session.usuario,
            fotos: publicacionesFeed
        });

    } catch (error) {
        console.error("Error al cargar el feed:", error);
        res.redirect('/');
    }
};

export const valorarPublicacion = async (req, res) => {
    try {
        const id_publicacion = req.params.id_publicacion; 
        const usuarioId = req.session.usuario.id;
        const { puntaje } = req.body;

        const [voto, created] = await Valoracion.findOrCreate({
            where: { 
                usuario_id: usuarioId, 
                publicacion_id: id_publicacion 
            },
            defaults: { 
                puntaje: puntaje,
                me_gusta: false
            }
        });

        if (!created) {
    
            await voto.update({ puntaje: puntaje });
        }

        req.session.save((err) => {
    if (err) {
        console.error("Error al guardar la sesión:", err);
    }
    return res.redirect(req.get('referer') || '/');
});
    } catch (error) {
        console.error("Error en la valoracion:", error);
        res.redirect('/');
    }
};