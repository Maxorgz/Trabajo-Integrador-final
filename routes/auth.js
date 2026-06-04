
import express from 'express';
import { User } from '../models/User.js';
import auth from './auth.js';
import { Router } from 'express';
const router = express.Router();

// Ruta para registrar un nuevo usuario 
router.post('/register', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    try {
        const newUser = await User.create({ firstName, lastName, email, password });
        res.status(201).json({ message: 'Usuario registrado exitosamente', user: newUser });
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({ message: 'Error al registrar usuario' });
    }
});

// Ruta para iniciar sesión
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        if (user.password !== password) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }
        res.status(200).json({ message: 'Inicio de sesión exitoso', user });
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).json({ message: 'Error al iniciar sesión' });
    }
});

export default router;
