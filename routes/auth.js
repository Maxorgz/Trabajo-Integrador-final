import express from 'express';
import { registrarUsuario } from '../controllers/authController.js';
import { iniciarSesion } from '../controllers/authController.js';
import { cerrarSesion } from '../controllers/authController.js';

const router = express.Router();

//registro
router.get('/register', (req, res) =>{
    res.render('register');
})
router.post('/register', registrarUsuario);

//login
router.get('/login', (req, res) => {
    res.render('login');
});
router.post('/login', iniciarSesion);

//logout
router.get('/logout', cerrarSesion);

export default router;