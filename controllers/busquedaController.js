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

        // persona
        if (tipo === 'personas') {
            resultados = await Usuario.findAll({
                where: {
                    nombre_usuario: {
                        [Op.iLike]: `%${q}%` 
                    }
                },
                attributes: ['id', 'nombre_usuario'] 
            });
        } 
        // publicacion
        else if (tipo === 'publicaciones') {
            resultados = await Publicacion.findAll({
                where: {
                    [Op.or]: [
                        { titulo: { [Op.iLike]: `%${q}%` } },
                        { descripcion: { [Op.iLike]: `%${q}%` } }
                    ]
                },
                include: [
                    { model: Imagen, as: 'imagenes' }, 
                    { model: Usuario, attributes: ['nombre_usuario'] }
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
