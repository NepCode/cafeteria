const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');
const app = express();






app.post('/login', (req, res) => {

    let body = req.body;

    Usuario.findOne( {email:body.email}, (err, usuarioDB) => {

        //any error 
        if(err) {
            return res.status(500).json({
                ok:false,
                err
            });
        }

        //wrong user 
        if(!usuarioDB) {
            return res.status(400).json({
                ok:false,
                err: {
                    message: '(Usuario) o contraseña incorrectos'
                }
            });
        }

         //wrong password
        if (!bcrypt.compareSync (body.password, usuarioDB.password )) {
            return res.status(400).json({
                ok:false,
                err: {
                    message: 'Usuario o (contraseña) incorrectos'
                }
            });
        }

        let token = jwt.sign({
            usuario: usuarioDB,
        
        }, process.env.AUTH_SEED, { expiresIn: process.env.EXPIRATION_DATE });

        res.json({
            ok:true,
            usuario: usuarioDB,
            token: token
        });



    });
    

});












module.exports = app;