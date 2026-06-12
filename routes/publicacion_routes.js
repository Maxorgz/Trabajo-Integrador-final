import express from 'express';
import { mostrarInicio } from '../controllers/publicacionController.js';
import { mostrarDetalleFoto } from '../controllers/publicacionController.js';
import { estaLogueado } from '../middlewares/auth.js';
import { mostrarFormularioNuevo } from '../controllers/publicacionController.js';
import { crearPublicacion } from '../controllers/publicacionController.js';
import { darMeGusta } from '../controllers/publicacionController.js';
import { valorarPublicacion } from '../controllers/publicacionController.js';
import { agregarComentario } from '../controllers/publicacionController.js';
import { esValidador } from '../middlewares/auth.js';
import { mostrarPerfil } from '../controllers/publicacionController.js';
import { eliminarComentario } from '../controllers/publicacionController.js';
import { realizarBusqueda } from '../controllers/publicacionController.js';
import { toggleSeguir } from '../controllers/usuarioController.js';
import { mostrarFeedSeguidos } from '../controllers/publicacionController.js';



const router = express.Router();

router.get('/', mostrarInicio);
router.get('/nuevaFoto', estaLogueado, mostrarFormularioNuevo);
router.post('/nuevaFoto', estaLogueado, crearPublicacion);
router.get('/foto/:id', mostrarDetalleFoto);
router.post('/publicacion/:id_publicacion/like', estaLogueado, darMeGusta);
router.post('/publicacion/:id_publicacion/valorar', estaLogueado, valorarPublicacion);
router.post('/publicacion/:id_publicacion/comentar', estaLogueado, agregarComentario);
router.get('/mi-perfil', estaLogueado, mostrarPerfil);
router.post('/comentario/:id_comentario/eliminar', estaLogueado, eliminarComentario);
router.get('/buscar', realizarBusqueda);
router.post('/usuario/:id/seguir', estaLogueado, toggleSeguir);
router.get('/feed', estaLogueado, mostrarFeedSeguidos);




export default router;