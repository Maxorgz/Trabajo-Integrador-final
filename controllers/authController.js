import { Usuario } from '../models/index.js';

export const registrarUsuario = async (req, res) => {
    try {
        const { nombre_usuario, email, password } = req.body;

        if (!email || !nombre_usuario || !password) {
            return res.render('register', {
                mensajeAlerta: {
                    status: 'error',
                    text: 'Todos los campos son obligatorios'
                }
            });
        }

        if (password.length < 6) {
            return res.render('register', {
                mensajeAlerta: {
                    status: 'error',
                    text: 'La contraseña debe tener al menos 6 caracteres'
                }
            });
        }

        const usuarioExistente = await Usuario.findOne({
            where: { email }
        });

        if (usuarioExistente) {
            return res.render('register', {
                mensajeAlerta: {
                    status: 'error',
                    text: 'Ese correo ya está registrado. Intenta iniciar sesión.'
                }
            });
        }

        await Usuario.create({
            nombre_usuario,
            email,
            password,
            rol: 'usuario',
            estado: 'activo'
        });

        return res.render('register', {
            mensajeAlerta: {
                status: 'success',
                text: 'Usuario registrado con éxito'
            }
        });

    } catch (error) {
        console.error('Error al registrar usuario:', error);

        return res.render('register', {
            mensajeAlerta: {
                status: 'error',
                text: 'Hubo un problema al crear la cuenta'
            }
        });
    }
};

export const iniciarSesion = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.render('login', {
                mensajeAlerta: {
                    status: 'error',
                    text: 'Por favor, ingresa tu correo y contraseña'
                }
            });
        }

        const usuario = await Usuario.findOne({
            where: { email }
        });

        if (!usuario) {
            return res.render('login', {
                mensajeAlerta: {
                    status: 'error',
                    text: 'El usuario no existe'
                }
            });
        }

        const contraseniaValida = password === usuario.password;

        if (!contraseniaValida) {
            return res.render('login', {
                mensajeAlerta: {
                    status: 'error',
                    text: 'Contraseña incorrecta'
                }
            });
        }

        req.session.usuario = {
            id: usuario.id,
            nombre_usuario: usuario.nombre_usuario,
            rol: usuario.rol
        };

        console.log('USUARIO EN SESION:', req.session.usuario);

        req.session.save((err) => {
            if (err) {
                console.error('Error al guardar sesión:', err);

                return res.render('login', {
                    mensajeAlerta: {
                        status: 'error',
                        text: 'Error al iniciar sesión'
                    }
                });
            }

            return res.redirect('/');
        });

    } catch (error) {
        console.error('Error al iniciar sesión:', error);

        return res.render('login', {
            mensajeAlerta: {
                status: 'error',
                text: 'Error al iniciar sesión'
            }
        });
    }
};

export const cerrarSesion = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error al cerrar sesión:', err);
            return res.redirect('/');
        }

        res.clearCookie('connect.sid');
        return res.redirect('/');
    });
};