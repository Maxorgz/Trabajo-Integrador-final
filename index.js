import 'dotenv/config';
import express from 'express';
import authRouter from './routes/auth.js';
import sequelize from './models/config.js';
import { Usuario, Publicacion, Imagen, Etiqueta } from './models/index.js';

//constantes
const app = express();
const PORT = process.env.PORT;

//middlewares
app.use(express.static('public'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

//motor de plantillas
app.set('view engine', 'pug');
app.set('views', './views');

//rutas
app.get('/', async (req, res) => {
    try {
        const fotosEncontradas = await Publicacion.findAll({
            include: [
                // ✅ Le agregamos el alias 'as' que definiste en tus modelos
                { model: Imagen, as: 'imagenes' }, 
                { model: Usuario },
                { model: Etiqueta, as: 'etiquetas' }
            ],
            order: [['createdAt', 'DESC']]
        });

        // Asegúrate de usar 'Etiquetas' (en plural) ya que así lo importaste en tus modelos
        const etiquetas = await Etiqueta.findAll();

        res.render('index', {
            fotos: fotosEncontradas,
            filtrosActuales: {}, 
            etiquetasSidebar: etiquetas 
        });
        
    } catch (error) {
        console.error("Error cargando la galería:", error);
        res.render('index', { fotos: [], filtrosActuales: {}, etiquetasSidebar: [] });
    }
});

app.use('/auth', authRouter);

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.get('/nuevaFoto', async (req, res) => {
    try {
        // Buscamos todas las etiquetas reales de la base de datos
        const etiquetas = await Etiqueta.findAll(); 
        
        // Se las pasamos al Pug con el mismo nombre que busca tu vista
        res.render('nuevaFoto', { etiquetas: etiquetas });
    } catch (error) {
        console.error("Error al cargar las etiquetas en el formulario:", error);
        res.render('nuevaFoto', { etiquetas: [] });
    }
});

app.get('/perfil', async (req, res) => {
    res.render('perfil');
});


app.get('/foto/:id', async (req, res) => {
    try {

        const fotoEncontrada = await Publicacion.findByPk(req.params.id, {
            include: [
                { model: Usuario },
                { model: Imagen, as: 'imagenes' },
                { model: Etiqueta, as: 'etiquetas' } 
            ]
        });

        if (!fotoEncontrada) {
            return res.status(404).send('Foto no encontrada');
        }

        res.render('DetalleFoto', { foto: fotoEncontrada });

    } catch (error) {
        console.error("Error al cargar el detalle:", error);
        res.status(500).send('Error al cargar la publicación');
    }
});

app.post('/nuevaFoto', async (req, res) => {
    try {
        const { titulo, descripcion, nuevas_etiquetas } = req.body;
        const etiquetasSeleccionadas = req.body.etiquetas; 

        // ✅ CORRECCIÓN 1: Capturar el array de Base64 sin importar si viene con o sin corchetes
        const imagenesBase64 = req.body.imagenes_base64 || req.body['imagenes_base64[]'];

        // 1. Creamos la publicación
        const nuevaPublicacion = await Publicacion.create({
            titulo: titulo,
            descripcion: descripcion,
            estado: 'publicado',
            comentarios_abiertos: true,
            usuario_id: 1 // Asegúrate de que el usuario con ID 1 exista en tu tabla 'usuarios'
        });

        // 2. Si el usuario subió una foto, la guardamos
        if (imagenesBase64 && imagenesBase64.length > 0) {
            const stringFoto = Array.isArray(imagenesBase64) ? imagenesBase64[0] : imagenesBase64;

            await Imagen.create({
                // ✅ DEVOLVER A SU NOMBRE ORIGINAL DE SEQUELIZE
                publicacion_id: nuevaPublicacion.id, 
                url_imagen: stringFoto,     
                licencia: 'Libre'
            });
        }

        // 3. Vinculamos las etiquetas
        if (etiquetasSeleccionadas && etiquetasSeleccionadas.length > 0) {
            // Nota: Si esto falla, verifica que la relación n:m esté bien declarada en tus modelos
            await nuevaPublicacion.addEtiquetas(etiquetasSeleccionadas);
        }

        //volvemos a la galería principal
        res.redirect('/');
        
    } catch (error) {
        console.error("=== ERROR CRÍTICO EN POST NUEVAFOTO ===");
        console.error(error);
        console.error("=======================================");
        
        res.status(500).send("Hubo un error al procesar tu foto.");
    }
});

//conexión a la base de datos
sequelize.sync({ alter: true })
    .then(() => {
    //Servidor
app.listen(PORT, (err) => {
    if (err) {
        console.error('Error al iniciar el servidor:', err);
        return;
    }
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
    })
    .catch((err) => {
        console.error('Error al conectar a la base de datos:', err);
    });
