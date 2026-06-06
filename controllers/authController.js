import bcrypt from 'bcryptjs';
import { Usuario } from '../models/index.js';

export const registrarUsuario = async (req, res) => {
    try {
        const { nombre_usuario, email, password } = req.body;

        if (!email || !nombre_usuario || !password) {
            return res.render('registro', { 
                mensajeAlerta: { status: 'error', text: 'Todos los campos son obligatorios' } 
            });
        }

        if (password.length < 6) {
            return res.render('registro', { 
                mensajeAlerta: { status: 'error', text: 'La contrasenia debe tener al menos 6 caracteres' } 
            });
        }

        const usuarioExistente = await Usuario.findOne({ where: { email: email } });
        if (usuarioExistente) {
            return res.render('registro', { 
                mensajeAlerta: { status: 'error', text: 'Ese correo ya esta registrado. Intenta iniciar sesion.' } 
            });
        }

        const salt = await bcrypt.genSalt(10);
        const contraseniaHasheada = await bcrypt.hash(password, salt);

        const nuevoUsuario = await Usuario.create({
            nombre_usuario: nombre_usuario,
            email: email,
            password: contraseniaHasheada, 
            rol: 'usuario',
            estado: 'activo'
        });

        return res.render('registro', { 
                mensajeAlerta: { status: 'success', text: 'Usuario registrado con exito' } 
            });

    } catch (error) {
        console.error('Error al registrar el usuario, ', error);
        res.render('registro', { 
            mensajeAlerta: { status: 'error', text: 'Hubo un problema al crear la cuenta' } 
        });
    }
};

export const iniciarSesion = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.render('login', { 
                mensajeAlerta: { status: 'error', text: 'Por favor, ingresa tu correo y contrasenia' } 
            });
        }

        const usuario = await Usuario.findOne({ where: { email: email } });
        
        if (!usuario) {
            return res.render('login', { 
                mensajeAlerta: { status: 'error', text: 'El usuario no existe' } 
            });
        }

        const contraseniaValida = await bcrypt.compare(password, usuario.password);
        
        if (!contraseniaValida) {
            return res.render('login', { 
                mensajeAlerta: { status: 'error', text: 'Contasenia incorrecta' } 
            });
        }

        req.session.usuario = {
            id: usuario.id,
            nombre: usuario.nombre_usuario,
            rol: usuario.rol
        };

        return res.redirect('/');

    } catch (error) {
        console.error('Error al iniciar sesion:', error);
        return res.render('login', { 
                mensajeAlerta: { status: 'error', text: 'Hubo un problema al procesar el login' } 
            });
    }
};

export const cerrarSesion = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error al cerrar la sesion:', err);
            return res.redirect('/');
        }
        
        res.clearCookie('connect.sid');
        
        return res.redirect('/');
    });
};