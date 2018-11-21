const express = require('express');
const bcrypt = require('bcryptjs');
const _ = require('underscore');
const Usuario = require('../models/usuario');
const { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');

const app = express();


app.get('/usuario', verificaToken , (req, res) => {

    /* return res.json({
        usuario: req.usuario,
        nombre: req.usuario.nombre,
        email: req.usuario.email
    }); */

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    Usuario.find({estado:true}, 'nombre email role estado google img')
    .skip(desde)
    .limit(limite)
    .exec( (err, usuarios) => {

        if(err) {
            return res.status(400).json({
                 ok: false,
                 err: err
             })
         }

         Usuario.count({estado:true}, (err, conteo) => {
            res.json({
                ok:true,
                usuarios: usuarios,
                count: conteo
            });
         })

      

    } )


});

app.post('/usuario', [verificaToken, verificaAdmin_Role] , function(req, res) {

    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password,10),
        role: body.role
    });

    usuario.save( (err, usuarioDB) => {

        if(err) {
           return res.status(400).json({
                ok: false,
                err: err
            })
        }

        //usuarioDB.password = null;

        res.json({
            ok: true,
            usuario: usuarioDB
        });

    });


 /*    if ( body.nombre === undefined) {
        res.status(400).json({
            ok: false,
            message: 'required name'
        });
    }else {
        res.json({
            persona : body
        });
    } */


});

app.put('/usuario/:id',  [verificaToken, verificaAdmin_Role]  , function (req, res)  {

    let id = req.params.id; // param url
    let body = _.pick (req.body,['nombre','email','img','role','estado']); //body form 

   /*  delete body.password;
    delete body.google; */

     Usuario.findByIdAndUpdate(id, body,{new: true, runValidators: true}, (err, usuarioDB) => {

        if(err) {
            return res.status(400).json({
                 ok: false,
                 err: err
             })
         }
 
 
         res.json({
             ok: true,
             usuario: usuarioDB
         });

      
    })

    /* res.json({
        id
    });  */

});

app.delete('/usuario2077/:id',verificaToken , function(req, res) {

    let id = req.params.id;

    //Schema
    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

        if(err) {
            return res.status(400).json({
                 ok: false,
                 err: err
             });
         }
 
         if(!usuarioBorrado ) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'user not found'
                }
            });
         }
 
         res.json({
             ok: true,
             usuario: usuarioBorrado
         });


    });

});

app.delete('/usuario/:id', [verificaToken, verificaAdmin_Role]  , function(req, res) {

    let id = req.params.id; // param url
    const userObj = {
        estado : false
        };

     //Usuario.findByIdAndUpdate(id, {$set: {  estado: false } }, {new : true} , (err, usuarioDB) => {
     Usuario.findByIdAndUpdate(id,userObj, {new : true} , (err, usuarioDB) => {

        if(err) {
            return res.status(400).json({
                 ok: false,
                 err: err
             })
         }
 
         res.json({
             ok: true,
             usuario: usuarioDB
         });
    })

});

module.exports = app;