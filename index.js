import 'dotenv/config';
import express from 'express';
import authRouter from './routes/auth.js';
import rutasPublicacion from './routes/publicacion_routes.js';
import sequelize from './config/db.js';
import session from 'express-session';

//constantes
const app = express();
const PORT = process.env.PORT;

//middlewares
app.use(express.static('public'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET || 'secreto_ultra_seguro_fotaza',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false,
        maxAge: 1000 * 60 * 60 * 24 
    }
}));

//motor de plantillas
app.set('view engine', 'pug');
app.set('views', './views');

//rutas
app.use('/', rutasPublicacion);
app.use('/auth', authRouter);


//conexión a la base de datos
sequelize.sync({ force: false })
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
    