import sequelize from 'sequelize';
import { Op } from "sequelize";
import { Publicacion } from "../models/Publicacion.js";
import { Usuario } from "../models/Usuario.js";
import { Imagen } from "../models/Imagen.js";

export const realizarBusqueda = async (req, res) => {
    try{
        const { tipo, q } = req.query;
        let resultados = [];

        if(!q || q.trim() === '') {
            return res.redirect(req.get('referer') || '/');
        }

        // BÚSQUEDA DE PERSONAS
        if (tipo === 'personas') {
            resultados = await Usuario.findAll({
                where: {
                    nombre_usuario: {
                        [Op.iLike]: `%${q}%` // Busca el texto en cualquier parte del nombre
                    }
                },
                attributes: ['id', 'nombre_usuario'] // Solo traemos lo necesario, NO contraseñas
            });
        } 
        // BÚSQUEDA DE PUBLICACIONES
        else if (tipo === 'publicaciones') {
            resultados = await Publicacion.findAll({
                where: {
                    [Op.or]: [ // Puede coincidir el título O la descripción
                        { titulo: { [Op.iLike]: `%${q}%` } },
                        { descripcion: { [Op.iLike]: `%${q}%` } }
                    ]
                },
                include: [
                    { model: Imagen, as: 'imagenes' }, // Para mostrar la miniatura
                    { model: Usuario, attributes: ['nombre_usuario'] } // Para saber de quién es
                ],
                order: [['createdAt', 'DESC']]
            });
        }

        res.render('resultadosBusqueda', {
            usuario: req.session.usuario,
            query: q,
            tipo: tipo,
            resultados: resultados
        });

    } catch (error) {
        console.error("Error en la búsqueda:", error);
        res.redirect('/');
    }
};
