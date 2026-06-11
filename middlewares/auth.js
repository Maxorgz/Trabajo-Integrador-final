export const estaLogueado = (req, res, next) => {
    if (req.session && req.session.usuario) {
        return next();
    }
    res.redirect('/auth/login');
};

export const esValidador = (req, res, next) => {
    if (req.session && req.session.usuario && 
       (req.session.usuario.rol === 'validador' || req.session.usuario.rol === 'admin')) {
        return next();
    }
    res.redirect('/');
};