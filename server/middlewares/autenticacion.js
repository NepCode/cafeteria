const jwt = require('jsonwebtoken');

// ============================
//  check token
// ============================
let verificaToken = (req, res, next) => {

    let token = req.get('Authorization'); //Authorization or token

    jwt.verify(token, process.env.AUTH_SEED, (err, decoded) => {

        if(err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'invalid token'
                }
            });
        }

        req.usuario = decoded.usuario;
        next();
    });


};



// ============================
//  check admin role
// ============================
let verificaAdmin_Role = (req, res, next) => {

    let usuario = req.usuario;

    if(usuario.role === 'ADMIN_ROLE') {
        next();
    } else {

     res.json({
        ok:false,
       /*  usuario_rol: usuario.role, */
        err: {
            message: 'user must be admin'
        }
    });

}
};


// ============================
//  check token img
// ============================
let verificaTokenImg = (req, res, next) => {

    let token = req.query.token;

    jwt.verify(token, process.env.AUTH_SEED, (err, decoded) => {

        if(err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'invalid token'
                }
            });
        }

        req.usuario = decoded.usuario;
        next();
    });
};



module.exports = {
    verificaToken,
    verificaAdmin_Role,
    verificaTokenImg
}

//module.exports.verificaToken = (req, res, next) => {



