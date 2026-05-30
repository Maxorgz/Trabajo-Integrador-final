import 'dotenv/config';
import express from 'express';

//constantes
const app = express();
const PORT = process.env.PORT;

//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//motor de plantillas
app.set('view engine', 'pug');
app.set('views', './views');

//rutas

//Servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});


