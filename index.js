import 'dotenv/config';
import express from 'express';
import authRouter from './routes/auth.js';
import sequelize from './models/config.js';

//constantes
const app = express();
const PORT = process.env.PORT;

//middlewares
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//motor de plantillas
app.set('view engine', 'pug');
app.set('views', './views');

//rutas
app.use('/auth', authRouter);
app.get('/', (req, res) => {
    res.render('index');
});


app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register');
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
