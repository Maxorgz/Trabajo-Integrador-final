import { Publicacion, Imagen, Usuario, Etiqueta, Valoracion, Comentarios, Seguidor, Notificacion, Coleccion, Denuncia, DenunciaComentario, Mensaje } from '../models/index.js';

//----------------------------------------------------------------------------
//home
export const mostrarInicio = async (req, res) => {
    try {
        const { categoria, orden } = req.query;
        const orderOption = orden === 'antiguas' ? [['createdAt', 'ASC']] : [['createdAt', 'DESC']];
        
        const includeEtiqueta = categoria 
            ? { model: Etiqueta, as: 'etiquetas', where: { nombre: categoria }, required: true }
            : { model: Etiqueta, as: 'etiquetas' };

        // usuario no registrado no ve copy
        const includeImagen = req.session.usuario 
            ? { model: Imagen, as: 'imagenes' }
            : { model: Imagen, as: 'imagenes', where: { licencia: 'sin_copyright' }, required: true };

        const opcionesBusqueda = {
            where: { estado: 'activa' },
            include: [
                includeImagen, 
                { model: Usuario, as: 'Usuario', attributes: ['nombre_usuario', 'apellido_usuario'] },
                includeEtiqueta
            ],
            order: orderOption,
            distinct: true 
        };

        if (categoria) {
            opcionesBusqueda.subQuery = false;
        }

        const fotosEncontradas = await Publicacion.findAll(opcionesBusqueda);
        const etiquetas = await Etiqueta.findAll();

        res.render('index', {
            usuario: req.session.usuario,
            fotos: fotosEncontradas,
            filtrosActuales: { 
                categoriaSeleccionada: categoria, 
                orden: orden 
            }, 
            etiquetasSidebar: etiquetas 
        });
        
    } catch (error) {
        console.error("Error cargando la galeria:", error);
        res.render('index', { 
            usuario: req.session?.usuario || null,
            fotos: [], 
            filtrosActuales: {}, 
            etiquetasSidebar: [] 
        });
    }
};
//-------------------------------------------------------------------
//Detallefoto
export const mostrarDetalleFoto = async (req, res) => {
    try {
        const idFoto = req.params.id;
        
        if (isNaN(idFoto)) {
            return res.status(404).send('Ruta no válida');
        }

        
        const fotoEncontrada = await Publicacion.findByPk(idFoto, {
            include: [
                { model: Usuario, attributes: ['nombre_usuario', 'apellido_usuario'] }, 
                { model: Imagen, as: 'imagenes' },
                { model: Etiqueta, as: 'etiquetas' },
                { model: Valoracion, as: 'valoraciones' },
                { 
                    model: Comentarios, 
                     as: 'comentarios',
                     include: [{ model: Usuario, as: 'Usuario', attributes: ['nombre_usuario', 'apellido_usuario'] }]
                }
            ],
            order: [
                [{ model: Comentarios, as: 'comentarios' }, 'createdAt', 'DESC']
            ]
        });

        if (!fotoEncontrada) {
            return res.status(404).send('Foto no encontrada');
        }

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

        let coleccionesUsuario = [];
        if (req.session.usuario) {
            coleccionesUsuario = await Coleccion.findAll({ 
                where: { usuario_id: req.session.usuario.id } 
            });
        }

        const mensajeFlash = req.session.mensajeFlash;
        if (mensajeFlash) {
            delete req.session.mensajeFlash;
        }

        res.render('detalleFoto', { 
            usuario: req.session.usuario,
            foto: fotoEncontrada,
            totalLikes,
            promedio,
            totalVotosPuntaje,
            misColecciones: coleccionesUsuario,
            mensajeFlash
        });

    } catch (error) {
        console.error("Error al cargar el detalle de la foto:", error);
        res.status(500).send('Error al cargar la publicación');
    }
};
//--------------------------------------------------------------------------
//mostrarFormulario
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
//--------------------------------------------------------------------------------------
//Crear publicacion
export const crearPublicacion = async (req,res)=>{
    try{
        //marca agua
        const { titulo, descripcion, tiene_copyright, marca_agua, imagenes_base64, etiquetas, nuevas_etiquetas } = req.body;
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

        //checkbox on
        const esCopyright = tiene_copyright === 'on';
        
        //por defecto pone marca de agua 
        const textoMarcaAgua = esCopyright ? (marca_agua && marca_agua.trim() !== '' ? marca_agua : '© Protegido por Copyright') : null;

        for (const base64Texto of arrayImagenes) {
            await Imagen.create({
                publicacion_id: nuevaPublicacion.id,
                url_imagen: base64Texto,
                licencia: esCopyright ? 'copyright' : 'sin_copyright',
                marca_agua: textoMarcaAgua
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
//----------------------------------------------------------------
//megusta
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
            }
        });

        if (!created) {
            await voto.update({ me_gusta: !voto.me_gusta });
        }

        if (voto.me_gusta) {
            await Notificacion.create({
                usuario_id: foto.usuario_id,
                actor_id: usuarioId,
                publicacion_id: id_publicacion,
                tipo: 'ME_GUSTA',
                leida: false
            });
        }

        req.session.save(() => {
            return res.redirect(`/foto/${id_publicacion}`);
        });

    } catch (error) {
        console.error("Error en el Me gusta:", error);
        res.redirect(id_publicacion ? `/foto/${id_publicacion}` : '/'); 
    }
};
//------------------------------------------------------------------------------
//EliminarPublicacion
export const eliminarPublicacion = async (req, res) => {
    try {
        const { id } = req.params;
        const usuarioId = req.session.usuario.id;
        const publicacion = await Publicacion.findByPk(id);

        if (publicacion && publicacion.usuario_id === usuarioId) {
            await publicacion.destroy();
        }
        res.redirect(`/perfil/${usuarioId}`);

    } catch (error) {
        console.error("Error al intentar eliminar la publicación:", error);
        res.redirect('/');
    }
};

//----------------------------------------------------------------------
//agregar comentario
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

            const publicacion = await Publicacion.findByPk(id_publicacion);
            
            if (publicacion && publicacion.usuario_id !== usuarioId) {
                await Notificacion.create({
                    usuario_id: publicacion.usuario_id, 
                    actor_id: usuarioId,                
                    tipo: 'COMENTARIO',
                    publicacion_id: publicacion.id
                });
            }
        }
        res.redirect(req.get('referer') || `/foto/${id_publicacion}`);
        
    } catch (error) {
        console.error("Error al agregar comentario:", error);
        res.redirect('/');
    }
};

//-----------------------------------------------------------------------
//eliminar comentarios
export const eliminarComentario = async (req, res) => {
    try {
        const { id_comentario } = req.params;
        const usuarioId = req.session.usuario.id;
        const comentario = await Comentarios.findByPk(id_comentario);

        if (comentario) {
            const fotoId = comentario.publicacion_id;
            const foto = await Publicacion.findByPk(fotoId);
            const esAutorComentario = comentario.usuario_id === usuarioId;
            const esDuenoFoto = foto && foto.usuario_id === usuarioId; 
            
            if (esAutorComentario || esDuenoFoto) {
                await DenunciaComentario.destroy({ 
                    where: { comentario_id: id_comentario } 
                });
                await comentario.destroy(); 
            }
            
            return req.session.save((err) => {
                if (err) {
                    console.error("Error al guardar la sesion:", err);
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
//-------------------------------------------------------------------
//Mostrar el perfil
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
        const cantSeguidores = await Seguidor.count({ where: { usuario_seguido_id: id } });
        const cantSeguidos = await Seguidor.count({ where: { usuario_seguidor_id: id } });

        let esMiPerfil = false;
        let loSigo = false;

        if (req.session.usuario) {
            esMiPerfil = req.session.usuario.id === parseInt(id);
            
            if (!esMiPerfil) {
                const relacion = await Seguidor.findOne({
                    where: {
                        usuario_seguidor_id: req.session.usuario.id,
                        usuario_seguido_id: id
                    }
                });
                if (relacion) loSigo = true;
            }
        }

        let comentariosReportados = [];
        if (esMiPerfil) {
            const comentarios = await Comentarios.findAll({
                include: [
                    {
                        model: Publicacion,
                        where: { usuario_id: req.session.usuario.id }, 
                        attributes: ['id'] 
                    },
                    {
                        model: DenunciaComentario,
                        as: 'denuncias', 
                        required: true,  
                        include: [{ model: Usuario, as: 'Denunciante', attributes: ['nombre_usuario', 'apellido_usuario'] }]
                    },
                    {
                        model: Usuario,
                        as: 'Usuario',
                        attributes: ['nombre_usuario']
                    }
                ]
            });
            comentariosReportados = comentarios.map(c => c.toJSON());
        }

        res.render('perfil', {
            usuario: req.session.usuario, 
            dueñoPerfil: perfilUsuario,   
            fotos: fotosPlanas,          
            cantSeguidores,
            cantSeguidos,
            esMiPerfil, 
            loSigo,
            comentariosReportados 
        });

    } catch (error) {
        console.error("Error al cargar el perfil:", error);
        res.redirect('/');
    }
};
//--------------------------------------------------
//funcion para mostrarseguidores
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
//--------------------------------------------------------------
 //funcion para valorar publicacion
export const valorarPublicacion = async (req, res) => {
    try {
        const id_publicacion = req.params.id_publicacion; 
        const usuarioId = req.session.usuario.id;
        const { puntaje } = req.body;
        const publicacion = await Publicacion.findByPk(id_publicacion);
        
        if (!publicacion || publicacion.usuario_id === usuarioId) {
            return res.redirect(req.get('referer') || '/');
        }

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
       
        await Notificacion.create({
            usuario_id: publicacion.usuario_id, 
            actor_id: usuarioId,               
            tipo: 'VALORACION',
            publicacion_id: publicacion.id,
            leida: false
        });

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

//-------------------------------------------------------------------------------
//boton seguir 
export const alternarSeguir = async (req, res) => {
    try {
        const id_a_seguir = req.params.id;
        const mi_id = req.session.usuario.id;
        
        if (id_a_seguir == mi_id) {
            return res.redirect('back'); 
        }
        
        const relacion = await Seguidor.findOne({
            where: { 
                usuario_seguidor_id: mi_id, 
                usuario_seguido_id: id_a_seguir 
            }
        });

        if (relacion) {
            await relacion.destroy();
        } else {
            await Seguidor.create({
                usuario_seguidor_id: mi_id,
                usuario_seguido_id: id_a_seguir
            });

            await Notificacion.create({
                usuario_id: id_a_seguir,
                actor_id: mi_id,        
                tipo: 'SEGUIDOR',
                publicacion_id: null    
            });
        }

        res.redirect(`/perfil/${id_a_seguir}`);

    } catch (error) {
        console.error("Error al seguir/dejar de seguir:", error);
        res.redirect('/');
    }
};
//Denuncia
export const denunciarPublicacion = async (req, res) => {
    try {
        const id_publicacion = req.params.id_publicacion;
        const usuarioId = req.session.usuario.id;
        const { motivo, justificacion } = req.body;
        const publicacion = await Publicacion.findByPk(id_publicacion);

        if (publicacion && publicacion.usuario_id !== usuarioId) {
            await Denuncia.create({
                motivo: motivo,
                justificacion: justificacion,
                publicacion_id: id_publicacion,
                usuario_id: usuarioId, 
                estado: 'pendiente' 
            });
            req.session.mensajeFlash = "Denuncia enviada para revision.";
        }

        res.redirect(`/foto/${id_publicacion}`);
    } catch (error) {
        console.error("Error al denunciar:", error);
        res.redirect('/');
    }
};

//denuncia comentario
export const denunciarComentario = async (req, res) => {
    try {
        const { id_comentario } = req.params;
        const usuarioId = req.session.usuario.id;
        const { motivo, justificacion } = req.body;
        const comentario = await Comentarios.findByPk(id_comentario);

        if (comentario && comentario.usuario_id !== usuarioId) {
            await DenunciaComentario.create({
                motivo: motivo,
                justificacion: justificacion,
                comentario_id: id_comentario,
                usuario_id: usuarioId,
                estado: 'pendiente' 
            });

            req.session.mensajeFlash = "Comentario denunciado exitosamente.";
        }
        res.redirect(`/foto/${comentario.publicacion_id}`);
    } catch (error) {
        console.error("Error al denunciar comentario:", error);
        res.redirect('/');
    }
};

export const meInteresa = async (req, res) => {
    try {
        const publicacion_id = req.params.id;
        const interesado_id = req.session.usuario.id;
        const foto = await Publicacion.findByPk(publicacion_id);

        if (!foto || foto.usuario_id === interesado_id) {
            return res.redirect(`/publicacion/${publicacion_id}`);
        }

        const autor_id = foto.usuario_id;
        const mensajePrevio = await Mensaje.findOne({
            where: {
                emisor_id: interesado_id,
                receptor_id: autor_id,
                publicacion_id: publicacion_id
            }
        });

        if (!mensajePrevio) {
            await Mensaje.create({
                emisor_id: interesado_id,
                receptor_id: autor_id,
                publicacion_id: publicacion_id,
                texto: "¡Hola! Me interesa esta imagen. ¿Podemos llegar a un acuerdo?"
            });
            
            await Notificacion.create({
                usuario_id: autor_id, 
                actor_id: interesado_id, 
                publicacion_id: publicacion_id,
                tipo: 'ME_INTERESA',
                leida: false
            });
        }
        
        res.redirect('/mis-mensajes'); 

    } catch (error) {
        console.error("Error al enviar Me interesa:", error);
        const publicacion_id = req.params.id;
        if (publicacion_id) {
            return res.redirect(`/publicacion/${publicacion_id}`);
        } else {
            return res.redirect('/');
        }
    }
}

export const mostrarEditar = async (req, res) => {
    try {
        const { id } = req.params;
        const usuarioId = req.session.usuario.id;
        const publicacion = await Publicacion.findByPk(id);
        if (!publicacion) return res.redirect('/');
        if (publicacion.usuario_id !== usuarioId) return res.redirect(`/foto/${id}`);

        //Bloquear si tiene denuncias
        const cantidadDenuncias = await Denuncia.count({ where: { publicacion_id: id } });
        if (cantidadDenuncias > 0) {
            return res.redirect(`/foto/${id}`);
        }

        res.render('editarFoto', {
            foto: publicacion,
            usuario: req.session.usuario
        });

    } catch (error) {
        console.error("Error al mostrar edición:", error);
        res.redirect('/');
    }
};

export const guardarEdicion = async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, descripcion } = req.body;
        const usuarioId = req.session.usuario.id;

        const publicacion = await Publicacion.findByPk(id);

        if (!publicacion || publicacion.usuario_id !== usuarioId) {
            return res.redirect('/');
        }

        const cantidadDenuncias = await Denuncia.count({ where: { publicacion_id: id } });
        if (cantidadDenuncias > 0) {
            return res.redirect(`/foto/${id}`);
        }

        publicacion.titulo = titulo;
        publicacion.descripcion = descripcion;
        await publicacion.save();

        res.redirect(`/foto/${id}`);

    } catch (error) {
        console.error("Error al guardar edición:", error);
        res.redirect(`/foto/${req.params.id}`);
    }
};